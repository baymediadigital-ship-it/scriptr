import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/user";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS, type BillingInterval } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { interval = "monthly" }: { interval?: BillingInterval } = await req.json().catch(() => ({}));

  // Read affiliate ref_code from cookie
  const refCode = req.cookies.get("ref_code")?.value ?? null;

  const supabase = await createClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = sub?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: {
        supabase_user_id: user.id,
        ...(refCode ? { affiliate_code: refCode } : {}),
      },
    });
    customerId = customer.id;
  } else if (refCode) {
    // Update existing customer metadata with affiliate code if not already set
    const existing = await stripe.customers.retrieve(customerId) as import("stripe").default.Customer;
    if (!existing.metadata?.affiliate_code) {
      await stripe.customers.update(customerId, {
        metadata: { ...existing.metadata, affiliate_code: refCode },
      });
    }
  }

  // Store affiliate_code on the subscription record so webhook can read it
  if (refCode) {
    const serviceSupabase = createServiceClient();
    await serviceSupabase
      .from("subscriptions")
      .update({ affiliate_code: refCode })
      .eq("user_id", user.id);
  }

  const priceId = interval === "yearly"
    ? PLANS.pro.yearly.priceId
    : PLANS.pro.monthly.priceId;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      // $5 one-time trial fee — charged immediately
      { price: PLANS.pro.trialPriceId, quantity: 1 },
      // recurring subscription — starts after 7-day trial
      { price: priceId, quantity: 1 },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    subscription_data: {
      trial_period_days: PLANS.pro.trialDays,
      metadata: { supabase_user_id: user.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
