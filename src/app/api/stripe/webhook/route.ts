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

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan,
      status: subscription.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}
