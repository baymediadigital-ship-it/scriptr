import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Zap, Star, Clock, TrendingDown, Lightbulb } from "lucide-react";
import { ScriptrMark } from "@/components/ui/logo";
import { PriceIncreaseBanner } from "@/components/landing/price-increase-banner";

export const metadata = {
  title: "Scriptr — Write Your Next YouTube Script in 60 Seconds",
  description: "Find proven video ideas, understand why they went viral, and write a full script in under 60 seconds. Powered by real YouTube data.",
};

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
  { icon: "🔍", title: "Find what's working", body: "Paste any YouTube channel. Scriptr surfaces every video performing 2x–10x above their average — sorted by recency." },
  { icon: "🧠", title: "Understand why it worked", body: "One-click AI breakdown of the title formula, audience psychology, and the exact moves that drove the views." },
  { icon: "✍️", title: "Script it in minutes", body: "Generate a full, ready-to-record script from any idea. Hook, body, CTA — structured for retention." },
  { icon: "💬", title: "Mine your audience", body: "Drop any YouTube URL and get the exact questions, frustrations, and phrases your viewers are already using." },
  { icon: "👀", title: "Track competitors", body: "Add channels in your niche. See their outliers the moment they post. Never miss a trend again." },
  { icon: "🖼️", title: "Generate thumbnails", body: "AI-designed thumbnails from any title. No Photoshop. No designer. Download and upload straight to YouTube." },
];

export default function LandingPageAd() {
  return (
    <div className="min-h-screen" style={{ background: "#08080f" }}>
      {/* Skip to main content — keyboard nav */}
      <a href="#main" className="skip-link">Skip to main content</a>

      {/* ── Price increase banner ──────────────────────────────────────── */}
      {process.env.NEXT_PUBLIC_PRICE_INCREASE_DATE && (
        <PriceIncreaseBanner dateStr={process.env.NEXT_PUBLIC_PRICE_INCREASE_DATE} />
      )}

      {/* ── Sticky nav ────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50" style={{ background: "rgba(8,8,15,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <nav className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto" aria-label="Main navigation">
          <div className="flex items-center gap-2">
            <ScriptrMark size={28} />
            <span className="font-bold text-white text-sm tracking-tight">Scriptr</span>
          </div>
          <Link
            href="/auth/signup"
            className="text-sm font-semibold text-white px-4 py-2.5 min-h-[44px] flex items-center rounded-xl transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 20px rgba(124,58,237,0.35)" }}
          >
            Start $5 trial
          </Link>
        </nav>
      </div>

      <main id="main">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative pt-16 pb-14 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.2) 0%, transparent 70%)" }} aria-hidden="true" />

          <div className="relative max-w-2xl mx-auto space-y-5">
            {/* Social proof bar */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#c4b5fd" }}
              aria-label="Trusted by YouTube creators in 20+ niches">
              <div className="flex -space-x-1" aria-hidden="true">
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

            <div className="pt-2 space-y-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 min-h-[52px] rounded-xl text-base font-bold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 32px rgba(124,58,237,0.45)" }}
              >
                Start your 7-day trial for $5
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <p className="text-xs text-white/25">Cancel in the first 7 days — pay nothing more. No contracts.</p>
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap pt-1" aria-label="Key features">
              {["Real YouTube data", "Instant scripts", "Cancel anytime"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-white/35">
                  <Check className="h-3 w-3 text-violet-400" aria-hidden="true" />{t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── The problem ───────────────────────────────────────────────── */}
        <section className="px-6 pb-16" aria-labelledby="problem-heading">
          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: Clock, label: "6 hours", desc: "Average time spent on idea research + scripting per video", color: "text-red-400", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
                { icon: TrendingDown, label: "94% of videos", desc: "Never break 1,000 views because the idea was never proven", color: "text-orange-400", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)" },
                { icon: Lightbulb, label: "Guesswork", desc: "Most creators pick ideas based on gut feel, not data", color: "text-yellow-400", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)" },
              ].map(({ icon: Icon, label, desc, color, bg, border }) => (
                <div key={label} className="rounded-2xl p-4 space-y-2" style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                  <p className={`text-lg font-bold ${color}`}>{label}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Demo video ────────────────────────────────────────────────── */}
        <section className="px-6 pb-14" aria-label="Product demo video">
          <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)" }}>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src="https://www.youtube.com/embed/lJR_nAw5Vpg?rel=0&modestbranding=1&color=white"
                title="Scriptr product demo — see how it works in 60 seconds"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
              />
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────────────── */}
        <section className="px-6 pb-16" aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading" className="sr-only">Creator testimonials</h2>
          <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-3">
            {TESTIMONIALS.map((r) => (
              <figure key={r.name} className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-sm text-white/65 leading-relaxed">"{r.text}"</blockquote>
                <figcaption className="flex items-center gap-2">
                  <img src={r.avatar} alt={`${r.name} profile photo`} className="w-7 h-7 rounded-full flex-shrink-0 object-cover" />
                  <div>
                    <p className="text-xs font-semibold text-white/80">{r.name}</p>
                    <p className="text-[10px] text-white/35">{r.handle}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section className="px-6 py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} aria-labelledby="features-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="features-heading" className="text-2xl font-bold text-center mb-10" style={{ letterSpacing: "-0.02em" }}>
              Everything you need to grow on YouTube — in one tool
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {FEATURES.map(({ icon, title, body }) => (
                <div key={title} className="flex gap-3 p-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white/90 mb-1">{title}</p>
                    <p className="text-xs text-white/45 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────────────── */}
        <section className="px-6 py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} aria-labelledby="pricing-heading">
          <div className="max-w-2xl mx-auto">
            <h2 id="pricing-heading" className="text-2xl font-bold text-center mb-8" style={{ letterSpacing: "-0.02em" }}>
              One plan. Everything included.
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Monthly */}
              <div className="rounded-2xl p-6 space-y-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Monthly</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-white">$29</span>
                    <span className="text-white/35 text-sm mb-1">/month</span>
                  </div>
                  <p className="text-xs text-white/25">7-day trial for $5 — cancel anytime</p>
                </div>
                <Link
                  href="/auth/signup"
                  className="block w-full py-3 min-h-[44px] rounded-xl text-sm font-semibold text-white/70 text-center transition-all hover:text-white hover:border-white/20"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Start $5 trial →
                </Link>
              </div>

              {/* Annual — highlighted */}
              <div className="rounded-2xl p-6 space-y-4 relative"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.4)", boxShadow: "0 0 32px rgba(124,58,237,0.12)" }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                    Best value
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Annual</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-white">$20</span>
                    <span className="text-white/35 text-sm mb-1">/month</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold">Save $99/year · Free strategy call included</p>
                </div>
                <Link
                  href="/auth/signup"
                  className="block w-full py-3 min-h-[44px] rounded-xl text-sm font-bold text-white text-center transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
                >
                  Start $5 trial →
                </Link>
              </div>
            </div>

            {/* Feature list shared */}
            <ul className="mt-6 grid sm:grid-cols-2 gap-2" aria-label="Included features">
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
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Objection busters ─────────────────────────────────────────── */}
        <section className="px-6 py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="sr-only">Frequently asked questions</h2>
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
        <section className="px-6 py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} aria-label="Call to action">
          <div className="max-w-lg mx-auto text-center space-y-5">
            <ScriptrMark size={40} className="mx-auto" />
            <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.03em" }}>
              Your next video is already proven.<br />You just need to script it.
            </h2>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 min-h-[52px] rounded-xl text-base font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 32px rgba(124,58,237,0.45)" }}
            >
              Start your 7-day trial for $5
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <p className="text-xs text-white/25">No contracts. Cancel anytime. Secure payment via Stripe.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
