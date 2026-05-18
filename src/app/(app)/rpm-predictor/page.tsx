"use client";

import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Data ────────────────────────────────────────────────────────────────────

const NICHES = [
  { label: "Finance & Investing", rpmLow: 15, rpmMid: 25, rpmHigh: 45 },
  { label: "Business & Entrepreneurship", rpmLow: 12, rpmMid: 20, rpmHigh: 35 },
  { label: "Real Estate", rpmLow: 10, rpmMid: 18, rpmHigh: 32 },
  { label: "Tech & Software", rpmLow: 8, rpmMid: 14, rpmHigh: 22 },
  { label: "Education & Tutorials", rpmLow: 6, rpmMid: 12, rpmHigh: 20 },
  { label: "Health & Fitness", rpmLow: 5, rpmMid: 9, rpmHigh: 15 },
  { label: "Food & Cooking", rpmLow: 3, rpmMid: 6, rpmHigh: 10 },
  { label: "Travel & Lifestyle", rpmLow: 4, rpmMid: 7, rpmHigh: 12 },
  { label: "Beauty & Fashion", rpmLow: 3, rpmMid: 6, rpmHigh: 10 },
  { label: "Gaming", rpmLow: 2, rpmMid: 4, rpmHigh: 7 },
  { label: "Sports", rpmLow: 2, rpmMid: 4, rpmHigh: 8 },
  { label: "Entertainment & Vlogs", rpmLow: 1, rpmMid: 3, rpmHigh: 6 },
  { label: "Music", rpmLow: 1, rpmMid: 2, rpmHigh: 4 },
  { label: "Kids & Family", rpmLow: 2, rpmMid: 4, rpmHigh: 7 },
];

const COUNTRIES = [
  { label: "United States", multiplier: 1.0 },
  { label: "United Kingdom", multiplier: 0.9 },
  { label: "Canada", multiplier: 0.85 },
  { label: "Australia", multiplier: 0.85 },
  { label: "Western Europe", multiplier: 0.7 },
  { label: "Eastern Europe", multiplier: 0.35 },
  { label: "India", multiplier: 0.2 },
  { label: "Southeast Asia", multiplier: 0.25 },
  { label: "Latin America", multiplier: 0.3 },
  { label: "Middle East", multiplier: 0.45 },
  { label: "Africa", multiplier: 0.2 },
  { label: "Mixed / Global", multiplier: 0.55 },
];

const LENGTHS = [
  { label: "Under 8 minutes", multiplier: 0.75 },
  { label: "8–15 minutes", multiplier: 1.0 },
  { label: "15–30 minutes", multiplier: 1.2 },
  { label: "30+ minutes", multiplier: 1.35 },
];

const SEASONS = [
  { label: "Q1 (Jan–Mar) — Post-holiday slump", multiplier: 0.75 },
  { label: "Q2 (Apr–Jun) — Steady recovery", multiplier: 0.95 },
  { label: "Q3 (Jul–Sep) — Summer dip", multiplier: 0.85 },
  { label: "Q4 (Oct–Dec) — Peak ad spend", multiplier: 1.35 },
];

const VIEW_PRESETS = [
  { label: "10K", value: 10_000 },
  { label: "50K", value: 50_000 },
  { label: "100K", value: 100_000 },
  { label: "500K", value: 500_000 },
  { label: "1M", value: 1_000_000 },
  { label: "5M", value: 5_000_000 },
];

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RPMPredictorPage() {
  const [niche, setNiche] = useState(NICHES[0].label);
  const [country, setCountry] = useState(COUNTRIES[0].label);
  const [length, setLength] = useState(LENGTHS[1].label);
  const [season, setSeason] = useState(SEASONS[3].label);
  const [monthlyViews, setMonthlyViews] = useState(100_000);

  const result = useMemo(() => {
    const n = NICHES.find((x) => x.label === niche) ?? NICHES[0];
    const c = COUNTRIES.find((x) => x.label === country) ?? COUNTRIES[0];
    const l = LENGTHS.find((x) => x.label === length) ?? LENGTHS[1];
    const s = SEASONS.find((x) => x.label === season) ?? SEASONS[3];

    const rpmLow = +(n.rpmLow * c.multiplier * l.multiplier * s.multiplier).toFixed(2);
    const rpmMid = +(n.rpmMid * c.multiplier * l.multiplier * s.multiplier).toFixed(2);
    const rpmHigh = +(n.rpmHigh * c.multiplier * l.multiplier * s.multiplier).toFixed(2);

    const revLow = (monthlyViews / 1000) * rpmLow;
    const revMid = (monthlyViews / 1000) * rpmMid;
    const revHigh = (monthlyViews / 1000) * rpmHigh;

    return { rpmLow, rpmMid, rpmHigh, revLow, revMid, revHigh };
  }, [niche, country, length, season, monthlyViews]);

  const tips = useMemo(() => {
    const list: string[] = [];
    const n = NICHES.find((x) => x.label === niche) ?? NICHES[0];
    const c = COUNTRIES.find((x) => x.label === country) ?? COUNTRIES[0];
    const l = LENGTHS.find((x) => x.label === length) ?? LENGTHS[1];

    if (n.rpmMid < 8)
      list.push(`${niche} has lower advertiser demand. Mixing in business, finance, or how-to angles can lift your RPM significantly.`);
    if (c.multiplier < 0.5)
      list.push("Your audience geography is dragging RPM down. Creating content specifically targeting US/UK audiences (topics, accent, references) can 2–3× your rate.");
    if (l.multiplier < 1.0)
      list.push("Videos under 8 minutes can only run one mid-roll ad. Hitting 8+ minutes unlocks mid-rolls and typically increases RPM by 25–35%.");
    list.push("Q4 (Oct–Dec) is peak ad spend season. Brands pay 30–50% more per impression — save your highest-effort videos for this window.");
    list.push("End screens and cards improve session time, which signals higher viewer intent to YouTube's algorithm — leading to better ad placements.");

    return list.slice(0, 4);
  }, [niche, country, length]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          <h1 className="text-2xl font-bold">RPM Predictor</h1>
        </div>
        <p className="text-white/40 text-sm">
          Estimate your YouTube RPM and monthly ad revenue based on niche, geography, video length, and season.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Inputs ── */}
        <div
          className="lg:col-span-2 rounded-2xl p-5 space-y-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Niche</Label>
            <Select value={niche} onValueChange={(v) => v && setNiche(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {NICHES.map((n) => <SelectItem key={n.label} value={n.label}>{n.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Primary audience country</Label>
            <Select value={country} onValueChange={(v) => v && setCountry(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => <SelectItem key={c.label} value={c.label}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Average video length</Label>
            <Select value={length} onValueChange={(v) => v && setLength(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LENGTHS.map((l) => <SelectItem key={l.label} value={l.label}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Season / quarter</Label>
            <Select value={season} onValueChange={(v) => v && setSeason(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEASONS.map((s) => <SelectItem key={s.label} value={s.label}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-white/50">Monthly views</Label>
              <span className="text-xs font-semibold text-white/70">
                {monthlyViews >= 1_000_000
                  ? `${(monthlyViews / 1_000_000).toFixed(1)}M`
                  : `${(monthlyViews / 1000).toFixed(0)}K`}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={5_000_000}
              step={1000}
              value={monthlyViews}
              onChange={(e) => setMonthlyViews(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex flex-wrap gap-1.5">
              {VIEW_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setMonthlyViews(p.value)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  style={monthlyViews === p.value
                    ? { background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.4)", color: "#c4b5fd" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* RPM range */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/70 mb-3">Estimated RPM</p>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
                ${result.rpmMid.toFixed(2)}
              </div>
              <div className="text-sm text-white/35 mb-1.5">per 1,000 views</div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-white/30">Range:</span>
              <span className="text-xs font-medium text-emerald-400">${result.rpmLow.toFixed(2)}</span>
              <span className="text-xs text-white/20">—</span>
              <span className="text-xs font-medium text-emerald-400">${result.rpmHigh.toFixed(2)}</span>
            </div>

            {/* RPM bar */}
            <div className="mt-4 space-y-1.5">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((result.rpmMid / 45) * 100, 100)}%`,
                    background: "linear-gradient(90deg, #10b981, #34d399)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/20">
                <span>$0</span>
                <span>$45+</span>
              </div>
            </div>
          </div>

          {/* Monthly revenue */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-4 space-y-1"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs text-white/35 uppercase tracking-widest font-semibold">Monthly</p>
              <p className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>{fmt(result.revMid)}</p>
              <p className="text-xs text-white/25">{fmt(result.revLow)} – {fmt(result.revHigh)}</p>
            </div>
            <div
              className="rounded-2xl p-4 space-y-1"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs text-white/35 uppercase tracking-widest font-semibold">Annual</p>
              <p className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>{fmt(result.revMid * 12)}</p>
              <p className="text-xs text-white/25">{fmt(result.revLow * 12)} – {fmt(result.revHigh * 12)}</p>
            </div>
          </div>

          {/* Tips */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">How to increase your RPM</p>
            </div>
            <ul className="space-y-2.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-white/50 leading-relaxed">
                  <span className="text-violet-400/50 font-bold mt-0.5 flex-shrink-0">↑</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
            <Info className="h-3.5 w-3.5 text-white/20 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/25 leading-relaxed">
              Estimates based on industry averages. Actual RPM varies by channel authority, upload frequency, viewer retention, and ad competition. Use as a directional guide, not a guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
