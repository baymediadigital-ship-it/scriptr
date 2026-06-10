"use client";

import { useState } from "react";
import { Megaphone, MessageSquare, BarChart2, Image, AtSign, CheckCircle2, Bell, Sparkles, Heart } from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquare,
    color: "text-blue-400",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.2)",
    title: "AI Comment Replies",
    description: "Train an AI on your voice and brand. It reads new comments, drafts replies that sound like you, and you approve before they post.",
    bullets: ["Matches your tone exactly", "Prioritises questions and high-engagement comments", "One-click approve or edit before posting"],
    eta: "Q3 2026",
  },
  {
    icon: BarChart2,
    color: "text-emerald-400",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
    title: "Community Polls",
    description: "Generate data-driven poll ideas based on your recent video topics. Ask your audience what they want next — and let the data guide your content plan.",
    bullets: ["Poll ideas from your video history", "Automatically schedule for peak engagement hours", "Results feed back into your Scriptr idea pipeline"],
    eta: "Q3 2026",
  },
  {
    icon: Image,
    color: "text-orange-400",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.2)",
    title: "Community Posts",
    description: "Write and schedule YouTube community posts — teasers, behind-the-scenes, milestone announcements — drafted by AI, posted on your schedule.",
    bullets: ["Post ideas tied to your upload calendar", "AI writes in your channel's voice", "Image + text posts, scheduled in advance"],
    eta: "Q4 2026",
  },
  {
    icon: Heart,
    color: "text-pink-400",
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.2)",
    title: "Engagement Digest",
    description: "Daily summary of your most active comment threads, top fan interactions, and comments that could spark a follow-up video.",
    bullets: ["Surfaces your most engaged viewers", "Finds comment threads worth replying to", "Spots video ideas hiding in your comments"],
    eta: "Q4 2026",
  },
];

export default function ChannelManagerPage() {
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
        body: JSON.stringify({ email, source: `channel-manager:${selected.join(",")}` }),
      });
    } catch { /* best-effort */ }
    setStatus("done");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.25)" }}>
            <Megaphone className="h-5 w-5 text-pink-400" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
            Coming soon
          </span>
        </div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>Channel Manager</h1>
        <p className="text-white/45 text-base leading-relaxed max-w-xl">
          Your AI-powered community layer. Reply to comments in your voice, post polls, schedule community updates — without spending hours in YouTube Studio.
        </p>
      </div>

      {/* Preview mockup */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <AtSign className="h-3.5 w-3.5 text-white/30" />
          <p className="text-xs text-white/30 font-medium">Preview — AI reply draft</p>
        </div>
        {[
          { user: "JordanK_Creates", comment: "Bro this video changed how I think about thumbnails. When's the next one??", reply: "Means everything to hear that Jordan 🙏 Next one drops Thursday — it's on the exact title formula I used on that 800K video. You're going to want to see it." },
          { user: "CreatorNate", comment: "Can you do a video on shorts vs long form for small channels?", reply: "That's genuinely one of the most asked questions I get — adding it to the queue. Short answer: long form wins if you're under 10K subs. I'll break down the data properly in the video." },
        ].map(({ user, comment, reply }) => (
          <div key={user} className="space-y-2">
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                {user[0]}
              </div>
              <div className="rounded-xl px-3 py-2 text-xs text-white/60" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="font-semibold text-white/70 mr-1.5">{user}</span>{comment}
              </div>
            </div>
            <div className="flex gap-2.5 ml-9">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "rgba(124,58,237,0.3)", color: "#c4b5fd" }}>
                Y
              </div>
              <div className="rounded-xl px-3 py-2 text-xs text-white/70 flex-1" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <span className="font-semibold text-violet-300 mr-1.5">You (AI draft)</span>{reply}
                <div className="flex gap-2 mt-2">
                  <button className="text-[10px] font-semibold text-emerald-400 px-2 py-1 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>✓ Post</button>
                  <button className="text-[10px] font-semibold text-white/30 px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>Edit</button>
                  <button className="text-[10px] font-semibold text-white/30 px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>Skip</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          const active = selected.includes(f.title);
          return (
            <button
              key={f.title}
              onClick={() => toggle(f.title)}
              className="text-left rounded-2xl p-5 space-y-3 transition-all cursor-pointer"
              style={{
                background: active ? f.bg : "rgba(255,255,255,0.025)",
                border: `1px solid ${active ? f.border : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                  <Icon className={`h-4 w-4 ${f.color}`} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/25 font-mono">{f.eta}</span>
                  {active && <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/85 mb-1">{f.title}</p>
                <p className="text-xs text-white/40 leading-relaxed">{f.description}</p>
              </div>
              <ul className="space-y-1">
                {f.bullets.map(b => (
                  <li key={b} className="flex items-start gap-1.5 text-xs text-white/30">
                    <span className={`mt-0.5 flex-shrink-0 ${f.color}`}>›</span>{b}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Interest capture */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(236,72,153,0.05)", border: "1px solid rgba(236,72,153,0.15)" }}>
        {status === "done" ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            <p className="font-semibold text-white/90">You&apos;re on the list.</p>
            <p className="text-sm text-white/40">We&apos;ll notify you the moment Channel Manager goes live.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-pink-400" />
              <p className="text-sm font-semibold text-white/80">Notify me when this launches</p>
            </div>
            {selected.length > 0 && (
              <p className="text-xs text-pink-300/70">Most wanted: {selected.join(", ")}</p>
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
                style={{ background: "linear-gradient(135deg,#ec4899,#be185d)" }}
              >
                <Sparkles className="h-4 w-4" />
                {status === "loading" ? "Saving…" : "Notify me"}
              </button>
            </form>
            <p className="text-xs text-white/25">Click the features above to vote — it helps us build the right things first.</p>
          </>
        )}
      </div>
    </div>
  );
}
