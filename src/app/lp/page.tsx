import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Zap, Star } from "lucide-react";
import { ScriptrMark } from "@/components/ui/logo";
import { PriceIncreaseBanner } from "@/components/landing/price-increase-banner";

export const metadata = {
  title: "Scriptr — Write Your Next YouTube Script in 60 Seconds",
  description: "Find proven video ideas, understand why they went viral, and write a full script in under 60 seconds. Powered by real YouTube data.",
};

const TESTIMONIALS = [
  { name: "Marcus L.", handle: "@marcuslive", text: "Used Scriptr to find an outlier in my niche, scripted it in 18 minutes. Hit 200K views. Not a coincidence." },
  { name: "Daniel F.", handle: "@danielftv", text: "Competitor tracking alone saved me from making 3 videos that already flopped for other channels. Huge." },
  { name: "Aisha B.", handle: "@aishabeauty", text: "Comment mining showed me my audience wanted tutorials, not vlogs. Switched format. Views up 3x." },
];

const FEATURES = [
  { emoji: "🔍", title: "Find what's working", body: "Paste any YouTube channel. Scriptr surfaces every video performing 2x–10x above their average — sorted by recency." },
  { emoji: "🧠", title: "Understand why it worked", body: "One-click AI breakdown of the title formula, audience psychology, and the exact moves that drove the views." },
  { emoji: "✍️", title: "Script it in minutes", body: "Generate a full, ready-to-record script from any idea. Hook, body, CTA — structured for retention." },
  { emoji: "💬", title: "Mine your audience", body: "Drop any YouTube URL and get the exact questions, frustrations, and phrases your viewers are already using." },
  { emoji: "👀", title: "Track competitors", body: "Add channels in your niche. See their outliers the moment they post. Never miss a trend again." },
  { emoji: "🖼️", title: "Generate thumbnails", body: "AI-designed thumbnails from any title. No Photoshop. No designer. Download and upload straight to YouTube." },
];

export default function LandingPageAd() {
  return (
    <div className="min-h-screen" style={{ background: "#08080f" }}>

      {/* ── Price increase banner ──────────────────────────────────────── */}
      {process.env.NEXT_PUBLIC_PRICE_INCREASE_DATE && (
        <PriceIncreaseBanner dateStr={process.env.NEXT_PUBLIC_PRICE_INCREASE_DATE} />
      )}

      {/* ── Minimal nav — no escape links ─────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <ScriptrMark size={28} />
          <span className="font-bold text-white text-sm tracking-tight">Scriptr</span>
        </div>
        <Link
          href="/auth/signup"
          className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 20px rgba(124,58,237,0.35)" }}
        >
          Start $5 trial
        </Link>
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
              {["M","D","A","T","S"].map((l, i) => (
                <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-[#08080f]"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>{l}</div>
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

          {/* CTA */}
          <div className="pt-2 space-y-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 32px rgba(124,58,237,0.45)" }}
            >
              Start your 7-day trial for $5
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-xs text-white/25">Cancel in the first 7 days — pay nothing more. No contracts.</p>
          </div>

          {/* Trust pills */}
          <div className="flex items-center justify-center gap-4 flex-wrap pt-1">
            {["Real YouTube data", "Instant scripts", "Cancel anytime"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-white/35">
                <Check className="h-3 w-3 text-violet-400" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials — above the fold ─────────────────────────────── */}
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
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                  {r.name[0]}
                </div>
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

      {/* ── Pricing — single focused card ─────────────────────────────── */}
      <section className="px-6 py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ letterSpacing: "-0.02em" }}>
            One plan. Everything included.
          </h2>
          <div className="rounded-2xl p-6 space-y-5"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 0 40px rgba(124,58,237,0.1)" }}>
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2"
                style={{ background: "rgba(124,58,237,0.2)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.3)" }}>
                <Zap className="h-3 w-3" /> 7-day trial for $5
              </div>
              <div className="flex items-end justify-center gap-1">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-white/35 text-sm mb-1.5">/month after trial</span>
              </div>
              <p className="text-xs text-white/30">Or $249/year (save $99) — includes a free strategy call</p>
            </div>

            <ul className="space-y-2.5">
              {[
                "Unlimited scripts",
                "Unlimited outlier searches",
                "Comment mining",
                "Competitor tracking",
                "Thumbnail studio",
                "Idea generator",
                "AI viral breakdown",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/auth/signup"
              className="block w-full py-3.5 rounded-xl text-sm font-bold text-white text-center transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}
            >
              Start your 7-day trial for $5 →
            </Link>
            <p className="text-center text-xs text-white/25">Cancel anytime in the first 7 days — you won't be charged anything more.</p>
          </div>
        </div>
      </section>

      {/* ── Objection busters ─────────────────────────────────────────── */}
      <section className="px-6 py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-2xl mx-auto space-y-3">
          {[
            { q: "Will the scripts actually sound like me?", a: "You pick the tone — conversational, educational, energetic, humorous. The AI writes to that style. Most creators run 2–3 edits and it's done. It's a starting point, not a finished product." },
            { q: "Is this just ChatGPT with a YouTube skin?", a: "No. Scriptr is built on real YouTube data — it pulls actual view counts, engagement, and comment sentiment from the YouTube API. ChatGPT is guessing. Scriptr is working from evidence." },
            { q: "What if I don't like it?", a: "Email us within 30 days and we'll refund you in full. No forms, no questions." },
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
        <div className="max-w-lg mx-auto text-center space-y-5">
          <ScriptrMark size={40} className="mx-auto" />
          <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.03em" }}>
            Your next video is already proven.<br />You just need to script it.
          </h2>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 32px rgba(124,58,237,0.45)" }}
          >
            Start your 7-day trial for $5
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-xs text-white/25">No contracts. Cancel anytime. Secure payment via Stripe.</p>
        </div>
      </section>

    </div>
  );
}
