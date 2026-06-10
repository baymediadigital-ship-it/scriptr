"use client";

import { useState } from "react";
import { Bot, Zap, GitBranch, Clock, Bell, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const WORKFLOWS = [
  {
    icon: "🎬",
    title: "Post → Script pipeline",
    description: "Upload a video idea to Scriptr and automatically get a full script, thumbnail concepts, and title options — ready before you hit record.",
    eta: "Q3 2026",
  },
  {
    icon: "📊",
    title: "Outlier alert → Idea",
    description: "When a competitor posts a video 3x their average, automatically generate a competing video idea and script for you to review.",
    eta: "Q3 2026",
  },
  {
    icon: "🔁",
    title: "Trend → Bulk scripts",
    description: "Spot a trending format? Automatically generate 5 variation scripts across your niche so you can ride the wave before it dies.",
    eta: "Q4 2026",
  },
  {
    icon: "📅",
    title: "Content calendar sync",
    description: "Connect your upload schedule. Scriptr auto-generates scripts for each slot based on your niche, seasonality, and what's trending.",
    eta: "Q4 2026",
  },
  {
    icon: "📩",
    title: "Weekly digest",
    description: "Every Monday, get a Slack or email digest of your top competitors' outliers, trending formats in your niche, and 3 ready-to-script ideas.",
    eta: "Q3 2026",
  },
  {
    icon: "🔗",
    title: "n8n / Zapier integration",
    description: "Trigger any Scriptr action from your existing workflows — connect to Notion, Google Sheets, Slack, or any tool you already use.",
    eta: "Q4 2026",
  },
];

export default function AutomationsPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(title: string) {
    setSelected(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: `automations:${selected.join(",")}` }),
      });
    } catch { /* best-effort */ }
    setStatus("done");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
            <Bot className="h-5 w-5 text-violet-400" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
            Coming soon
          </span>
        </div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>Automations</h1>
        <p className="text-white/45 text-base leading-relaxed max-w-xl">
          Set it and forget it. Connect Scriptr to your workflow and let it run — from spotting outliers to delivering a ready-to-record script, automatically.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: "6 hrs", label: "saved per video on average" },
          { value: "0 clicks", label: "to go from trend → script" },
          { value: "∞", label: "workflows you can chain" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-2xl font-bold text-violet-300">{value}</p>
            <p className="text-xs text-white/35 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Workflow cards */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-4 w-4 text-violet-400" />
          <p className="text-sm font-semibold text-white/70">Planned workflows — click what matters to you</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WORKFLOWS.map((w) => {
            const active = selected.includes(w.title);
            return (
              <button
                key={w.title}
                onClick={() => toggle(w.title)}
                className="text-left rounded-2xl p-4 space-y-2 transition-all cursor-pointer"
                style={{
                  background: active ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.025)",
                  border: `1px solid ${active ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xl">{w.icon}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] text-white/25 font-mono">{w.eta}</span>
                    {active && <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />}
                  </div>
                </div>
                <p className="text-sm font-semibold text-white/80">{w.title}</p>
                <p className="text-xs text-white/40 leading-relaxed">{w.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interest capture */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
        {status === "done" ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            <p className="font-semibold text-white/90">You&apos;re on the list.</p>
            <p className="text-sm text-white/40">We&apos;ll notify you when Automations launches — your votes help us prioritise.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-violet-400" />
              <p className="text-sm font-semibold text-white/80">Notify me when this launches</p>
            </div>
            {selected.length > 0 && (
              <p className="text-xs text-violet-300/70">
                Voted for: {selected.join(", ")}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500 transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
              >
                <Sparkles className="h-4 w-4" />
                {status === "loading" ? "Saving…" : "Notify me"}
              </button>
            </form>
            <p className="text-xs text-white/25">Your votes help us decide which workflows to build first.</p>
          </>
        )}
      </div>
    </div>
  );
}
