import Link from "next/link";
import { ScriptrLogo, ScriptrMark } from "@/components/ui/logo";
import {
  TrendingUp, FileText, MessageSquareText, Users, Image, Sparkles,
  ArrowRight, CheckCircle2, Zap, X, Check,
} from "lucide-react";
import { ThumbnailCarousel } from "@/components/landing/thumbnail-carousel";
import { PriceIncreaseBanner } from "@/components/landing/price-increase-banner";

const FEATURES = [
  {
    icon: TrendingUp,
    color: "#a78bfa",
    title: "Outlier Detector",
    desc: "Paste any YouTube handle. Scriptr pulls their last 50 videos and surfaces every video performing 2x–10x above the channel's median — sorted by recency so you see what's blowing up right now.",
  },
  {
    icon: Sparkles,
    color: "#fb923c",
    title: "Why It Went Viral",
    desc: "One click on any outlier gives you a full AI breakdown: title formula, audience psychology, what the comments reveal, and exactly how to replicate it.",
  },
  {
    icon: FileText,
    color: "#60a5fa",
    title: "Script Writer",
    desc: "Turn any outlier into a full script in minutes. The AI knows the hook, the angle, and the pacing that made the original work — and applies it to your idea.",
  },
  {
    icon: MessageSquareText,
    color: "#34d399",
    title: "Comment Mining",
    desc: "Drop a YouTube URL and get a structured breakdown of what viewers loved, what they're asking for, and what to make next — extracted from the top comments.",
  },
  {
    icon: Users,
    color: "#f472b6",
    title: "Competitor Tracking",
    desc: "Add channels in your niche. Scriptr checks them every 6 hours, flags new outliers, and shows you their most-viewed videos sorted by performance.",
  },
  {
    icon: Image,
    color: "#fbbf24",
    title: "Thumbnail Studio",
    desc: "Generate four ready-to-use thumbnails from any video title. Claude designs the concepts, FLUX renders the images. Download and upload straight to YouTube.",
  },
];

const STEPS = [
  { n: "01", title: "Find what's working", body: "Search any YouTube channel or niche. Scriptr surfaces outlier videos — the ones quietly outperforming everything else." },
  { n: "02", title: "Understand why", body: "Get a one-click AI breakdown of the title formula, audience psychology, and the exact moves that drove the views." },
  { n: "03", title: "Script and ship", body: "Generate a full video script based on the proven angle. Add a thumbnail. You're done." },
];

const STATS = [
  { value: "12K+", label: "Scripts generated" },
  { value: "15 min", label: "Avg. time to finished script" },
  { value: "50K+", label: "Channels analyzed" },
  { value: "8+ hrs", label: "Saved per week" },
];

const COMPARISON_ROWS = [
  "Live YouTube data",
  "Outlier detection",
  "Comment mining",
  "Competitor tracking",
  "Script → Thumbnail workflow",
  "Niche-specific context",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#08080f" }}>

      {/* ── Price increase banner (only shown when env var is set) ───────── */}
      {process.env.NEXT_PUBLIC_PRICE_INCREASE_DATE && (
        <PriceIncreaseBanner dateStr={process.env.NEXT_PUBLIC_PRICE_INCREASE_DATE} />
      )}

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(8,8,15,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <ScriptrLogo />
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5">
            Log in
          </Link>
          <Link href="/auth/signup"
            className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 20px rgba(124,58,237,0.35)" }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, transparent 70%)" }} />

        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#c4b5fd" }}>
            <Zap className="h-3 w-3" />
            Powered by real YouTube data + Claude AI
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-[1.08]" style={{ letterSpacing: "-0.03em" }}>
            Find what works on YouTube.{" "}
            <span style={{ background: "linear-gradient(135deg,#c4b5fd 0%,#8b5cf6 50%,#6366f1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Script it in minutes.
            </span>
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Scriptr finds outlier videos in any niche, breaks down exactly why they worked, and helps you write compelling scripts — all from real YouTube data.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <Link href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 28px rgba(124,58,237,0.4)" }}>
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
              Log in
            </Link>
          </div>
          <p className="text-xs text-white/25">Start for $5 today — cancel anytime in the first 7 days.</p>
        </div>
      </section>

      {/* ── Demo video ───────────────────────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)",
          }}>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src="https://www.youtube.com/embed/lJR_nAw5Vpg?rel=0&modestbranding=1&color=white"
              title="Scriptr Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Fake UI preview ─────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="mx-auto text-xs text-white/20 font-mono">scriptr.app/outliers</div>
          </div>
          <div className="p-5 space-y-3">
            {[
              { score: "18.4x", label: "Mega", bg: "rgba(234,179,8,0.15)", color: "#fbbf24", title: "I Tried Every AI Tool for 30 Days — Here's What Actually Works", views: "4.2M", days: "12d ago", thumb: "https://i.ytimg.com/vi/B9LizOAAoLg/hqdefault.jpg" },
              { score: "7.1x", label: "High", bg: "rgba(249,115,22,0.15)", color: "#fb923c", title: "The $0 YouTube Setup That Gets 100K Views", views: "1.8M", days: "3d ago", thumb: "https://i.ytimg.com/vi/S7UM5lSgAg8/hqdefault.jpg" },
              { score: "4.3x", label: "High", bg: "rgba(249,115,22,0.15)", color: "#fb923c", title: "Why 99% of Creators Quit Before This Moment", views: "920K", days: "27d ago", thumb: "https://i.ytimg.com/vi/SVTPv4sI_Jc/hqdefault.jpg" },
              { score: "2.1x", label: "Moderate", bg: "rgba(59,130,246,0.15)", color: "#60a5fa", title: "How I Went From 0 to 50K Subscribers in 6 Months", views: "440K", days: "45d ago", thumb: "https://i.ytimg.com/vi/n-gYFcVx-8Y/hqdefault.jpg" },
            ].map((row) => (
              <div key={row.title} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <img src={row.thumb} alt={row.title} className="w-24 h-[54px] rounded-lg flex-shrink-0 object-cover" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: row.bg, color: row.color }}>
                    {row.score} · {row.label}
                  </span>
                  <p className="text-sm font-medium text-white/85 truncate">{row.title}</p>
                  <p className="text-xs text-white/30">{row.views} views · {row.days}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col gap-1.5">
                  <div className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white text-center" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>Script it</div>
                  <div className="px-3 py-1.5 rounded-lg text-xs font-semibold text-center" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>Why?</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl font-bold" style={{ letterSpacing: "-0.02em" }}>Scriptr by the numbers</h2>
            <p className="text-sm text-white/35">Trusted by creators who take YouTube seriously.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="rounded-2xl p-6 text-center space-y-2"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-3xl font-bold" style={{ background: "linear-gradient(135deg,#c4b5fd,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-0.03em" }}>
                  {value}
                </p>
                <p className="text-xs text-white/35 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">How it works</p>
            <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>From idea to script in three steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.n} className="space-y-4">
                <div className="text-5xl font-bold" style={{ color: "rgba(124,58,237,0.25)", letterSpacing: "-0.04em" }}>{step.n}</div>
                <div>
                  <h3 className="font-semibold text-white/90 mb-2">{step.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ───────────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Everything you need</p>
            <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>One toolkit. Every stage of the process.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl space-y-3"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <h3 className="font-semibold text-white/90 text-sm">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ──────────────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Why Scriptr</p>
            <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>Built for creators, not generic AI</h2>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="p-4 text-white/30">Feature</div>
              <div className="p-4 text-center" style={{ color: "#a78bfa", borderLeft: "1px solid rgba(255,255,255,0.06)", background: "rgba(124,58,237,0.08)" }}>Scriptr</div>
              <div className="p-4 text-center text-white/30" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>ChatGPT / Claude</div>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={row} className="grid grid-cols-3 text-sm"
                style={{ borderBottom: i < COMPARISON_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                <div className="p-4 text-white/50">{row}</div>
                <div className="p-4 flex justify-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", background: "rgba(124,58,237,0.04)" }}>
                  <CheckCircle2 className="h-4 w-4" style={{ color: "#a78bfa" }} />
                </div>
                <div className="p-4 flex justify-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <X className="h-2.5 w-2.5 text-white/25" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Thumbnail carousel ───────────────────────────────────────────── */}
      <section className="py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="text-center mb-10 px-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Thumbnail Studio</p>
          <h2 className="text-2xl font-bold" style={{ letterSpacing: "-0.02em" }}>
            Real thumbnails generated by Scriptr
          </h2>
          <p className="text-sm text-white/35">Trained on 25,000+ high-performing YouTube videos.</p>
        </div>
        <ThumbnailCarousel />
      </section>

      {/* ── Video reviews ────────────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Creator reviews</p>
            <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>Hear it from the creators</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 items-start">
            {[
              { name: "Alex R.", handle: "@alexcreates", subs: "124K", quote: "Scriptr cut my research time in half. I find outliers in 5 minutes and have a script drafted in 20." },
              { name: "Priya M.", handle: "@priyabuilds", subs: "48K", quote: "The comment mining feature alone is worth it. I finally know what my audience actually wants to see next." },
              { name: "James T.", handle: "@jamestech", subs: "310K", quote: "I was skeptical about AI scripts but Scriptr nails the structure. Saved me hours on my last 4 videos." },
            ].map((r) => (
              <div key={r.name} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {/* 9:16 short-form video placeholder */}
                <div className="w-full relative flex items-center justify-center"
                  style={{ aspectRatio: "9/16", background: "rgba(124,58,237,0.06)" }}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.4)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-xs text-white/25">Short review</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-white/65 leading-relaxed">"{r.quote}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/80">{r.name}</p>
                      <p className="text-[10px] text-white/35">{r.handle} · {r.subs} subscribers</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screenshot reviews ───────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">What they're saying</p>
            <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>Creators love Scriptr</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "ViniiTube", handle: "@viniitube1", avatar: "https://yt3.ggpht.com/ytc/AIdro_lFghYbUGDpMTt805Cz6lmO61QdgFm5KiEEdmg6NFB0VP0=s800-c-k-c0x00ffffff-no-rj", text: "Used Scriptr to find an outlier in my niche, scripted it in 18 minutes. Hit 200K views. Not a coincidence.", stars: 5 },
              { name: "True Crime Chronicles", handle: "@cr1mechronicles", avatar: "https://yt3.ggpht.com/U4T3sXSpOHbdZh3uQyYllsfdgW_r8Nt9p9VjEDLm0C345vBxdvWo9l6fVUAexZafTZkkI6ksew=s800-c-k-c0x00ffffff-no-rj", text: "Competitor tracking alone saved me from making 3 videos that already flopped for other channels. Huge.", stars: 5 },
              { name: "The TV Regent", handle: "@thetvregent", avatar: "https://yt3.ggpht.com/ytc/AIdro_nKWHeQkJBLlovr9dTqkw38__Y1BBI22Iyy4S24IV0VhIE=s800-c-k-c0x00ffffff-no-rj", text: "Script quality is better than what I was writing myself after 4 years. That's embarrassing to admit but it's true.", stars: 5 },
            ].map((r, i) => (
              <div key={i} className="p-4 rounded-2xl space-y-3"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex gap-0.5">
                  {[...Array(r.stars)].map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
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
        </div>
      </section>

      {/* ── Annual perks ─────────────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-2xl mx-auto rounded-2xl p-8 text-center space-y-5"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(124,58,237,0.2)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.3)" }}>
            Annual plan only
          </div>
          <h2 className="text-2xl font-bold" style={{ letterSpacing: "-0.02em" }}>Free 1-on-1 YouTube strategy call</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">
            Every annual subscriber gets a 30-minute strategy call with our team — we'll audit your channel, break down your best opportunities, and build a content plan based on real outlier data.
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
            Get annual access
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">FAQ</p>
            <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>Common questions</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Do you offer a money-back guarantee?",
                a: "Yes. If Scriptr isn't the right fit, email us within 30 days of purchase and we'll refund you in full — no questions asked.",
              },
              {
                q: "What AI models does Scriptr use?",
                a: "Scriptr is built on Claude (Anthropic) for scripts and breakdowns, and FLUX for thumbnail generation. We update the models regularly as better ones become available.",
              },
              {
                q: "Why do only annual subscribers get the strategy call?",
                a: "The call is a real 30-minute session with our team — not a sales pitch. We can only offer that to creators who are genuinely invested in the long term. Annual billing is how we know you're serious.",
              },
              {
                q: "Do I need any technical skills to use Scriptr?",
                a: "None at all. Most creators finish their first script within 15 minutes of signing up. Paste a YouTube handle, pick an outlier, click Script it — that's the whole flow.",
              },
              {
                q: "What if I don't like the script it generates?",
                a: "Keep going. Ask for a rewrite, change the tone, adjust the hook — the script editor is built for iteration. Most creators run 2–3 passes before they're happy.",
              },
              {
                q: "Will this work for small or new channels?",
                a: "Especially for small channels. Finding proven outlier angles levels the playing field — you're not guessing what works, you're borrowing from what's already working in your niche.",
              },
              {
                q: "What types of channels does Scriptr support?",
                a: "Any format — faceless, talking-head, tutorials, reviews, documentaries, finance, fitness, gaming, business. If it exists on YouTube, Scriptr can help you script it.",
              },
              {
                q: "What languages does Scriptr support?",
                a: "Scriptr is optimised for English. That said, the outlier detection, comment mining, and script generation all work in other languages — creators use it in 20+ languages with a quick final edit in their native tongue.",
              },
            ].map((item, i) => (
              <details key={i} className="group rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-sm font-medium text-white/80 hover:text-white transition-colors">
                  {item.q}
                  <svg className="h-4 w-4 flex-shrink-0 text-white/30 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-white/50 leading-relaxed" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "0.75rem" }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.03em" }}>
              Simple pricing. Cancel anytime.
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              Start any plan with a <span className="text-white/70 font-medium">$5 trial for 7 days</span> — cancel in the first 7 days and pay nothing more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Monthly */}
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div>
                <p className="text-xs text-white/35 uppercase tracking-widest font-semibold mb-2">Monthly</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-white">$29</span>
                  <span className="text-white/35 text-sm mb-1">/month</span>
                </div>
                <p className="text-white/35 text-xs mt-1">$5 trial for 7 days, then $29/mo</p>
              </div>
              <ul className="space-y-2.5">
                {[
                  "Unlimited outlier searches",
                  "Unlimited scripts",
                  "Unlimited competitors",
                  "Comment mining",
                  "Idea generator",
                  "Thumbnail studio",
                  "AI viral breakdown",
                  "Research assistant",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                    <Check className="h-4 w-4 text-violet-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all"
                style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd" }}
              >
                Start $5 trial
              </Link>
            </div>

            {/* Annual — highlighted */}
            <div
              className="rounded-2xl p-6 space-y-5 relative overflow-hidden"
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.35)",
                boxShadow: "0 0 40px rgba(124,58,237,0.12)",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(124,58,237,0.2)" }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-violet-400 uppercase tracking-widest font-semibold">Annual</p>
                  <span
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}
                  >
                    Save $99
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-white">$249</span>
                  <span className="text-white/35 text-sm mb-1">/year</span>
                </div>
                <p className="text-white/35 text-xs mt-1">$20.75/mo · $5 trial for 7 days, then $249/yr</p>
              </div>
              <ul className="space-y-2.5 relative">
                {[
                  "Everything in Monthly",
                  "Team seats ($4.99/seat)",
                  "Strategy call included",
                  "Best value for serious creators",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/75">
                    <Check className="h-4 w-4 text-violet-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="relative">
                <Link
                  href="/auth/signup"
                  className="block w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}
                >
                  Start $5 trial
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-white/25 mt-8">
            Secure payment via Stripe · Cancel in the first 7 days for a full refund · No hidden fees
          </p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-28" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-xl mx-auto text-center space-y-6">
          <ScriptrMark size={48} className="mx-auto" />
          <h2 className="text-4xl font-bold" style={{ letterSpacing: "-0.03em" }}>
            Ready to stop guessing?
          </h2>
          <p className="text-white/45 leading-relaxed">
            Join creators using Scriptr to find proven ideas and write better videos — in a fraction of the time.
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 32px rgba(124,58,237,0.45)" }}>
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="px-6 py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <ScriptrLogo />
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="/faq" className="hover:text-white/60 transition-colors">FAQ</Link>
            <Link href="/auth/login" className="hover:text-white/60 transition-colors">Log in</Link>
            <Link href="/auth/signup" className="hover:text-white/60 transition-colors">Sign up</Link>
            <span>© {new Date().getFullYear()} Scriptr</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
