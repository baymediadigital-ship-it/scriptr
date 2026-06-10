import { getUser } from "@/lib/supabase/user";
import { getSubscription, isPro, getLimits } from "@/lib/billing/subscription";
import { getUsage } from "@/lib/billing/usage";
import { PLANS } from "@/lib/stripe/client";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { PortalButton } from "@/components/billing/portal-button";
import { PlanToggle } from "@/components/billing/plan-toggle";
import { UpgradeSync } from "@/components/billing/upgrade-sync";
import { VoiceProfile } from "@/components/settings/voice-profile";
import { TeamMembers } from "@/components/settings/team-members";
import { Check, Crown, Lock } from "lucide-react";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const [user, params] = await Promise.all([getUser(), searchParams]);
  const subscription = await getSubscription(user!.id);
  const usage = await getUsage(user!.id);
  const limits = getLimits(subscription);
  const pro = isPro(subscription);
  const upgraded = params?.upgraded === "true";

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-white/40 mt-1 text-sm">Manage your plan, voice profile, and account.</p>
      </div>

      {upgraded && (
        <>
          <UpgradeSync />
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)" }}
          >
            <Crown className="h-5 w-5 text-violet-400 flex-shrink-0" />
            <p className="text-sm text-white/80">You&apos;re now on Pro. All limits removed.</p>
          </div>
        </>
      )}

      {/* Current plan */}
      <div
        className="rounded-2xl p-6 space-y-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Current Plan</p>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{PLANS[subscription.plan].name}</h2>
              {pro && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}
                >
                  Active
                </span>
              )}
              {subscription.isLegacy && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  <Lock className="h-2.5 w-2.5" />
                  Legacy — $29/mo locked in forever
                </span>
              )}
            </div>
            {pro && subscription.currentPeriodEnd && (
              <p className="text-xs text-white/30 mt-1">
                {subscription.cancelAtPeriodEnd
                  ? `Cancels on ${subscription.currentPeriodEnd.toLocaleDateString()}`
                  : `Renews on ${subscription.currentPeriodEnd.toLocaleDateString()}`}
              </p>
            )}
          </div>
          {pro ? <PortalButton /> : <CheckoutButton />}
        </div>

        {!pro && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">This month&apos;s usage</p>
            <UsageMeter label="Outlier searches" used={usage.outlierSearches} limit={limits.outlierSearches} />
            <UsageMeter label="Scripts generated" used={usage.scriptsGenerated} limit={limits.scriptsGenerated} />
            <UsageMeter label="Tracked competitors" used={0} limit={limits.trackedCompetitors} note="checked at add time" />
          </div>
        )}
      </div>

      {/* Plan toggle */}
      {!pro && <PlanToggle />}

      {/* Team seats — Pro only */}
      {pro && <TeamMembers />}

      {/* Voice profile */}
      <VoiceProfile />

      {/* Account */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">Account</p>
        <p className="text-sm text-white/60">{user?.email}</p>
      </div>
    </div>
  );
}

function UsageMeter({ label, used, limit, note }: { label: string; used: number; limit: number; note?: string }) {
  const pct = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100);
  const near = pct >= 80;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">{label}{note ? ` (${note})` : ""}</span>
        <span className={near ? "text-orange-400" : "text-white/40"}>
          {limit === Infinity ? "∞" : `${used} / ${limit}`}
        </span>
      </div>
      {limit !== Infinity && (
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: near ? "#f97316" : "linear-gradient(90deg,#7c3aed,#6d28d9)" }}
          />
        </div>
      )}
    </div>
  );
}
