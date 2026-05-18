import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/service";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Idempotency: skip already-processed events
  const { data: existing } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("event_id", event.id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, skipped: true });
  }

  // Record event before processing to prevent duplicate handling on retries
  await supabase.from("stripe_events").insert({ event_id: event.id, type: event.type });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

      let userId = subscription.metadata?.supabase_user_id;
      if (!userId) {
        const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
        userId = customer.metadata?.supabase_user_id;
      }
      if (!userId) break;

      await upsertSubscription(supabase, userId, session.customer as string, subscription);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      let userId = subscription.metadata?.supabase_user_id;
      if (!userId) {
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        userId = customer.metadata?.supabase_user_id;
      }
      if (!userId) break;

      await upsertSubscription(supabase, userId, subscription.customer as string, subscription);
      break;
    }

    // invoice.payment_succeeded — record affiliate commissions
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.amount_paid || invoice.amount_paid === 0) break;

      // Resolve the supabase user_id from customer metadata
      let userId: string | undefined;
      if (invoice.customer) {
        const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
        userId = customer.metadata?.supabase_user_id;
      }
      if (!userId) break;

      // Check if there's an affiliate code stored on the subscription row
      const { data: subRow } = await supabase
        .from("subscriptions")
        .select("affiliate_code")
        .eq("user_id", userId)
        .single();

      const affiliateCode = subRow?.affiliate_code;
      if (!affiliateCode) break;

      // Look up the affiliate
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id")
        .eq("code", affiliateCode)
        .eq("active", true)
        .single();

      if (!affiliate) break;

      const commissionCents = Math.round(invoice.amount_paid * 0.30);

      await supabase.from("affiliate_conversions").insert({
        affiliate_id: affiliate.id,
        referred_user_id: userId,
        stripe_invoice_id: invoice.id,
        amount_cents: invoice.amount_paid,
        commission_cents: commissionCents,
        paid_out: false,
      });

      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  supabase: ReturnType<typeof import("@/lib/supabase/service").createServiceClient>,
  userId: string,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const plan = ["active", "trialing"].includes(subscription.status) ? "pro" : "free";
  const periodEnd = subscription.items.data[0]?.current_period_end;
  const priceId = subscription.items.data[0]?.price?.id ?? null;

  // A user is legacy if they're on the original $29 price (not the V2 price)
  const legacyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const isLegacy = plan === "pro" && priceId === legacyPriceId;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan,
      status: subscription.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      is_legacy: isLegacy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}
