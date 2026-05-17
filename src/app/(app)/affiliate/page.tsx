import { getUser } from "@/lib/supabase/user";
import { createServiceClient } from "@/lib/supabase/service";
import { Users, MousePointerClick, TrendingUp, DollarSign, Clock } from "lucide-react";
import { CopyLinkButton } from "./copy-button";

export default async function AffiliatePage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = createServiceClient();

  // Look up affiliate record
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, code, name, email, active, created_at")
    .eq("user_id", user.id)
    .single();

  // Not an affiliate
  if (!affiliate) {
    return (
      <div className="max-w-xl mx-auto mt-24 text-center space-y-4 animate-fade-up">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2"
          style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <Users className="h-7 w-7 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold">Affiliate Program</h1>
        <p className="text-white/45 text-sm leading-relaxed">
          You&apos;re not part of our affiliate program yet.
          <br />
          Apply at{" "}
          <a
            href="mailto:deals@viralexchange.com"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            deals@viralexchange.com
          </a>
        </p>
      </div>
    );
  }

  const referralLink = `https://www.getscriptr.io?ref=${affiliate.code}`;

  // Fetch stats in parallel
  const [{ count: totalClicks }, { data: conversions }] = await Promise.all([
    supabase
      .from("affiliate_clicks")
      .select("id", { count: "exact", head: true })
      .eq("affiliate_id", affiliate.id),
    supabase
      .from("affiliate_conversions")
      .select("id, amount_cents, commission_cents, paid_out, created_at")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const conversionList = conversions ?? [];
  const totalEarningsCents = conversionList.reduce((sum, c) => sum + c.commission_cents, 0);
  const pendingCents = conversionList
    .filter((c) => !c.paid_out)
    .reduce((sum, c) => sum + c.commission_cents, 0);

  function formatDollars(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  const stats = [
    {
      label: "Total Clicks",
      value: (totalClicks ?? 0).toLocaleString(),
      icon: MousePointerClick,
      color: "text-blue-400",
      bg: "rgba(59,130,246,0.1)",
      border: "rgba(59,130,246,0.2)",
    },
    {
      label: "Total Conversions",
      value: conversionList.length.toLocaleString(),
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.2)",
    },
    {
      label: "Total Earnings",
      value: formatDollars(totalEarningsCents),
      icon: DollarSign,
      color: "text-violet-400",
      bg: "rgba(124,58,237,0.1)",
      border: "rgba(124,58,237,0.2)",
    },
    {
      label: "Pending Payout",
      value: formatDollars(pendingCents),
      icon: Clock,
      color: "text-amber-400",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
          <p className="text-white/40 mt-1 text-sm">
            {affiliate.name ? `Welcome, ${affiliate.name}.` : "Welcome."} Earn 30% on every successful payment you refer.
          </p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
          style={{
            background: "rgba(124,58,237,0.15)",
            color: "#c4b5fd",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          30% recurring commission
        </span>
      </div>

      {/* Referral link */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Your Referral Link</p>
        <div className="flex items-center gap-3 flex-wrap">
          <code
            className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm font-mono truncate"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#a78bfa" }}
          >
            {referralLink}
          </code>
          <CopyLinkButton link={referralLink} />
        </div>
        <p className="text-xs text-white/30">
          Share this link. Anyone who signs up and pays becomes your referral.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="rounded-2xl p-4 space-y-2"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-white/35">{label}</p>
          </div>
        ))}
      </div>

      {/* Conversions table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Recent Conversions</p>
        </div>

        {conversionList.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-white/30 text-sm">No conversions yet. Start sharing your link!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white/30 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white/30 uppercase tracking-widest">Commission</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white/30 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {conversionList.map((conversion) => (
                  <tr
                    key={conversion.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td className="px-6 py-3.5 text-white/50">
                      {new Date(conversion.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3.5 text-right text-white/60 font-mono">
                      {formatDollars(conversion.amount_cents)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono" style={{ color: "#a78bfa" }}>
                      {formatDollars(conversion.commission_cents)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span
                        className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={
                          conversion.paid_out
                            ? { background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }
                            : { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" }
                        }
                      >
                        {conversion.paid_out ? "Paid" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
