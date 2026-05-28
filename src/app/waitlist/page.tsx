"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Star } from "lucide-react";
import { ScriptrMark } from "@/components/ui/logo";

const TESTIMONIALS = [
  {
    name: "ViniiTube",
    handle: "@viniitube1",
    avatar: "https://yt3.ggpht.com/ytc/AIdro_lFghYbUGDpMTt805Cz6lmO61QdgFm5KiEEdmg6NFB0VP0=s800-c-k-c0x00ffffff-no-rj",
    text: "Used Scriptr to find an outlier in my niche, scripted it in 18 minutes. Hit 200K views. Not a coincidence.",
  },
  {
    name: "The TV Regent",
    handle: "@thetvregent",
    avatar: "https://yt3.ggpht.com/ytc/AIdro_nKWHeQkJBLlovr9dTqkw38__Y1BBI22Iyy4S24IV0VhIE=s800-c-k-c0x00ffffff-no-rj",
    text: "Comment mining showed me my audience wanted tutorials, not vlogs. Switched format. Views up 3x.",
  },
  {
    name: "True Crime Chronicles",
    handle: "@cr1mechronicles",
    avatar: "https://yt3.ggpht.com/U4T3sXSpOHbdZh3uQyYllsfdgW_r8Nt9p9VjEDLm0C345vBxdvWo9l6fVUAexZafTZkkI6ksew=s800-c-k-c0x00ffffff-no-rj",
    text: "Competitor tracking alone saved me from making 3 videos that already flopped for other channels. Huge.",
  },
];

const FEATURES = [
  { emoji: "🔍", title: "Find what's working", body: "Paste any YouTube channel. Scriptr surfaces every video performing 2x–10x above their average — sorted by recency." },
  { emoji: "🧠", title: "Understand why it worked", body: "One-click AI breakdown of the title formula, audience psychology, and the exact moves that drove the views." },
  { emoji: "✍️", title: "Script it in minutes", body: "Generate a full, ready-to-record script from any idea. Hook, body, CTA — structured for retention." },
  { emoji: "💬", title: "Mine your audience", body: "Drop any YouTube URL and get the exact questions, frustrations, and phrases your viewers are already using." },
  { emoji: "👀", title: "Track competitors", body: "Add channels in your niche. See their outliers the moment they post. Never miss a trend again." },
  { emoji: "🖼️", title: "Generate thumbnails", body: "AI-designed thumbnails from any title. No Photoshop. No designer. Download and upload straight to YouTube." },
];

function WaitlistForm({ source, size = "default" }: { source: string; size?: "default" | "large" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMsg(data.error ?? "Something went wrong. Try again.");
      } else {
        setStatus("success");
        setMsg(data.alreadyJoined ? "You're already on the list! We'll be in touch." : "You're on the list! We'll email you when we open access.");
      }
    } catch {
      setStatus("error");
      setMsg("Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={`flex flex-col items-center gap-2 ${size === "large" ? "py-4" : "py-2"}`}>
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <CheckCircle2 className="h-5 w-5" />
          {msg}
        </div>
        <p className="text-xs text-white/30">Share with a creator friend and skip the line.</p>
      </div>
    );
  }

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex gap-2 w-full max-w-md mx-auto ${isLarge ? "flex-col sm:flex-row" : "flex-row"}`}>
        <input
          ref={inputRef}
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`flex-1 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-violet-500 transition-colors ${
            isLarge ? "px-5 py-4 text-base" : "px-4 py-3 text-sm"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className={`flex-shrink-0 flex items-center justify-center gap-2 rounded-xl font-bold text-white transition-all disabled:opacity-50 cursor-pointer ${
            isLarge ? "px-8 py-4 text-base" : "px-5 py-3 text-sm"
          }`}
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}
        >
          {status === "loading" ? "Joining…" : (
            <>
              Get early access
              <ArrowRight className={isLarge ? "h-5 w-5" : "h-4 w-4"} />
            </>
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-400 text-center mt-2">{msg}</p>
      )}
    </form>
  );
}

export default function WaitlistPage() {
  return (
    <div className="min-h-screen" style={{ background: "#08080f" }}>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <ScriptrMark size={28} />
          <span className="font-bold text-white text-sm tracking-tight">Scriptr</span>
        </div>
        <a
          href="#waitlist"
          className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 20px rgba(124,58,237,0.35)" }}
        >
          Join waitlist
        </a>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-14 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.2) 0%, transparent 70%)" }} />

        <div className="relative max-w-2xl mx-auto space-y-5">
          {/* Social proof bar */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#c4b5fd" }}>
            <div className="flex -space-x-1">
              {[
                { name: "Alex Hormozi",      avatar: "https://yt3.ggpht.com/29XFUn3pc3cC81yUUCFiyCKKdgi856IGMJ4EZBnf53zTfrWWUGvmYnYGx86K08f4XR03UxpWyw=s800-c-k-c0x00ffffff-no-rj" },
                { name: "Jordan Welch",       avatar: "https://yt3.ggpht.com/cI1CYAcD8GLd9mjW7rZnkQugsagZN5LPnigbsZcHNXaEZXIIcXRuC_-60xN6j9pa0EpizBAA=s800-c-k-c0x00ffffff-no-rj" },
                { name: "Nonstop",            avatar: "https://yt3.ggpht.com/K_7w0RqxZcIRdiRO55fLzC-USfG8kxtf-n_OfJ5148hh9-fwSno3a8MlIUeC3ADY6KMFdOaOnGg=s800-c-k-c0x00ffffff-no-rj" },
                { name: "dime",               avatar: "https://yt3.ggpht.com/jAvKuPA36AuHPmo3n6ZvGh-dE3fFwh6J9o0m0_YdC_cIaTLJupkC3EPd-AGCBMwrbVImMHkunw=s800-c-k-c0x00ffffff-no-rj" },
                { name: "Golden Hoops",       avatar: "https://yt3.ggpht.com/ytc/AIdro_l5eA5S4i_YlP7FJXMug8ODiqYNJbUqhODWvTQEALjqxDI=s800-c-k-c0x00ffffff-no-rj" },
                { name: "The Diary Of A CEO", avatar: "https://yt3.ggpht.com/JHCZDz37bsTmwoE1o4LEodF5vhsHfk29kCEauDTFr27-7hHXsHHvvWGzcG77v32ERrkpfInkGQ=s800-c-k-c0x00ffffff-no-rj" },
              ].map((c, i) => (
                <img key={i} src={c.avatar} alt={c.name} title={c.name}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-[#08080f]" />
              ))}
            </div>
            <span>Trusted by YouTube creators in 20+ niches</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1]" style={{ letterSpacing: "-0.03em" }}>
            Most YouTubers spend 6 hours generating ideas and writing scripts.{" "}
            <span style={{ background: "linear-gradient(135deg,#c4b5fd 0%,#8b5cf6 50%,#6366f1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Scriptr does it in 60 seconds.
            </span>
          </h1>

          <p className="text-base text-white/50 max-w-lg mx-auto leading-relaxed">
            Find proven video ideas, understand why they went viral, and write a full script — all powered by real YouTube data.
          </p>

          {/* Waitlist form */}
          <div id="waitlist" className="pt-2 flex flex-col items-center gap-3">
            <WaitlistForm source="hero" size="large" />
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {["Real YouTube data", "Instant scripts", "Free to join"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-white/35">
                  <Check className="h-3 w-3 text-violet-400" />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo video ────────────────────────────────────────────────── */}
      <section className="px-6 pb-14">
        <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)" }}>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src="https://www.youtube.com/embed/lJR_nAw5Vpg?rel=0&modestbranding=1&color=white"
              title="Scriptr Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
            />
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-3">
          {TESTIMONIALS.map((r) => (
            <div key={r.name} className="rounded-2xl p-4 space-y-3"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-white/65 leading-relaxed">"{r.text}"</p>
              <div className="flex items-center gap-2">
                <img src={r.avatar} alt={r.name} className="w-7 h-7 rounded-full flex-shrink-0 object-cover" />
                <div>
                  <p className="text-xs font-semibold text-white/80">{r.name}</p>
                  <p className="text-[10px] text-white/35">{r.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section className="px-6 py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ letterSpacing: "-0.02em" }}>
            Everything you need to grow on YouTube — in one tool
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map(({ emoji, title, body }) => (
              <div key={title} className="flex gap-3 p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white/90 mb-1">{title}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Objection busters ─────────────────────────────────────────── */}
      <section className="px-6 py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-2xl mx-auto space-y-3">
          {[
            { q: "Will the scripts actually sound like me?", a: "You pick the tone — conversational, educational, energetic, humorous. The AI writes to that style. Most creators run 2–3 edits and it's done. It's a starting point, not a finished product." },
            { q: "Is this just ChatGPT with a YouTube skin?", a: "No. Scriptr is built on real YouTube data — it pulls actual view counts, engagement, and comment sentiment from the YouTube API. ChatGPT is guessing. Scriptr is working from evidence." },
            { q: "When does it launch?", a: "We're opening access in batches. Join the waitlist and you'll be first to know — waitlist members also get an exclusive founding rate when we open." },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl p-5 space-y-2"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-sm font-semibold text-white/85">{item.q}</p>
              <p className="text-sm text-white/45 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-lg mx-auto text-center space-y-6">
          <ScriptrMark size={40} className="mx-auto" />
          <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.03em" }}>
            Your next video is already proven.<br />You just need to script it.
          </h2>
          <WaitlistForm source="footer" size="large" />
          <p className="text-xs text-white/25">No spam. Just early access + a founding member rate when we open.</p>
        </div>
      </section>

    </div>
  );
}
