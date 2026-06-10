import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/user";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/service";
import type Stripe from "stripe";

/**
 * POST /api/stripe/sync
 * Pulls the latest subscription from Stripe and writes it to Supabase.
 * Called automatically after checkout redirect when the webhook may not have
 * fired yet (race condition between success URL redirect and webhook delivery).
 */
export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();

  // Look up the customer ID we stored during checkout
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!sub?.stripe_customer_id) {
    // No customer yet — try finding by email
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    if (!customers.data.length) {
      return NextResponse.json({ synced: false, reason: "no_customer" });
    }
    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });
    if (!subscriptions.data.length) {
      return NextResponse.json({ synced: false, reason: "no_subscription" });
    }
    await upsert(supabase, user.id, customerId, subscriptions.data[0]);
    return NextResponse.json({ synced: true });
  }

  // We have a customer ID — get their subscriptions
  const subscriptions = await stripe.subscriptions.list({
    customer: sub.stripe_customer_id,
    status: "all",
    limit: 1,
  });

  if (!subscriptions.data.length) {
    return NextResponse.json({ synced: false, reason: "no_subscription" });
  }

  await upsert(supabase, user.id, sub.stripe_customer_id, subscriptions.data[0]);
  return NextResponse.json({ synced: true });
}

async function upsert(
  supabase: ReturnType<typeof import("@/lib/supabase/service").createServiceClient>,
  userId: string,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const plan = ["active", "trialing"].includes(subscription.status) ? "pro" : "free";
  const periodEnd = subscription.items.data[0]?.current_period_end;
  const priceId = subscription.items.data[0]?.price?.id ?? null;
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
