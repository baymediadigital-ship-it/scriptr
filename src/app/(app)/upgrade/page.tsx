import { getUser } from "@/lib/supabase/user";
import { getSubscription, isPro } from "@/lib/billing/subscription";
import { PLANS } from "@/lib/stripe/client";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { PortalButton } from "@/components/billing/portal-button";
import { PlanToggle } from "@/components/billing/plan-toggle";
import { Check, Crown, Zap } from "lucide-react";
import { redirect } from "next/navigation";

const FREE_FEATURES = [
  "10 outlier searches / month",
  "5 scripts / month",
  "2 tracked competitors",
  "Comment mining",
  "Idea generator",
  "Thumbnail studio",
];

const PRO_FEATURES = [
  "Unlimited outlier searches",
  "Unlimited scripts",
  "Unlimited competitors",
  "Comment mining",
  "Idea generator",
  "Thumbnail studio",
  "AI viral breakdown",
  "Research assistant",
  "Team seats ($4.99/seat)",
  "Strategy call (annual plan)",
  "Priority support",
];

export default async function UpgradePage() {
  const user = await getUser();
  const subscription = await getSubscription(user!.id);
  const pro = isPro(subscription);

  if (pro) redirect("/settings");

  return (
    <div className="max-w-4xl mx-auto py-4 animate-fade-up">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold"
          style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
          <Zap className="h-3.5 w-3.5" />
          7-day trial for $5
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Upgrade to <span className="gradient-text">Pro</span>
        </h1>
        <p className="text-white/45 text-sm max-w-md mx-auto">
          Remove all limits and get full access to every tool. Cancel anytime in the first 7 days.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center mb-8">
        <PlanToggle />
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* Free */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div>
            <p className="text-xs text-white/35 uppercase tracking-widest font-semibold mb-2">Free</p>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-white/35 text-sm mb-1">/month</span>
            </div>
            <p className="text-white/35 text-xs mt-1">Good for getting started</p>
          </div>

          <ul className="space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-white/50">
                <Check className="h-4 w-4 text-white/25 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div
            className="w-full py-2.5 rounded-xl text-sm font-medium text-center"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Current plan
          </div>
        </div>

        {/* Pro */}
        <div
          className="rounded-2xl p-6 space-y-5 relative overflow-hidden"
          style={{
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.35)",
            boxShadow: "0 0 40px rgba(124,58,237,0.12)",
          }}
        >
          {/* Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(124,58,237,0.2)" }} />

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-violet-400 uppercase tracking-widest font-semibold">Pro</p>
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                <Crown className="h-3 w-3" /> Most popular
              </span>
            </div>

            <div className="flex items-end gap-1">
              <span className="text-xs text-white/40 line-through mr-1">starts at $29</span>
              <span className="text-white/60 text-sm mb-1">Try for</span>
              <span className="text-3xl font-bold text-white">$5</span>
              <span className="text-white/35 text-sm mb-1">/ 7 days</span>
            </div>
            <p className="text-white/35 text-xs mt-1">Then $29/mo or $249/yr — cancel anytime</p>
          </div>

          <ul className="space-y-2.5 relative">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-white/75">
                <Check className="h-4 w-4 text-violet-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="relative">
            <CheckoutButton interval="yearly" className="w-full" />
          </div>
        </div>
      </div>

      {/* Trust line */}
      <p className="text-center text-xs text-white/25">
        Secure payment via Stripe · Cancel in the first 7 days for a full refund · No hidden fees
      </p>
    </div>
  );
}
