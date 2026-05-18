import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { PLANS, type Plan } from "@/lib/stripe/client";

export type Subscription = {
  plan: Plan;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  isLegacy: boolean;
};

export const getSubscription = cache(async (userId: string): Promise<Subscription> => {
  const supabase = await createClient();

  // If this user is a team member, inherit the owner's subscription
  const { data: membership } = await supabase
    .from("team_members")
    .select("owner_id")
    .eq("member_id", userId)
    .maybeSingle();

  const lookupId = membership?.owner_id ?? userId;

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", lookupId)
    .single();

  if (!data) {
    return {
      plan: "free",
      status: "active",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      isLegacy: false,
    };
  }

  return {
    plan: (data.plan as Plan) ?? "free",
    status: data.status,
    currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    isLegacy: data.is_legacy ?? false,
  };
});

export function isPro(subscription: Subscription) {
  return subscription.plan === "pro" && ["active", "trialing"].includes(subscription.status);
}

export function getLimits(subscription: Subscription) {
  return PLANS[subscription.plan].limits;
}
