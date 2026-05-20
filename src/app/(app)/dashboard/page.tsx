import { getUser } from "@/lib/supabase/user";
import { TrendingUp, FileText, Users, BookOpen, ImageIcon, ArrowRight, Lightbulb, MessageSquareText } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  {
    href: "/ideas",
    icon: Lightbulb,
    title: "Idea Generator",
    description: "20 proven video ideas for your niche — ready to script",
    gradient: "from-yellow-500/20 to-amber-500/10",
    iconColor: "text-yellow-400",
  },
  {
    href: "/outliers",
    icon: TrendingUp,
    title: "Outlier Detector",
    description: "Find videos getting 2–10x more views than channel average",
    gradient: "from-orange-500/20 to-red-500/10",
    iconColor: "text-orange-400",
  },
  {
    href: "/scripts",
    icon: FileText,
    title: "Script Writer",
    description: "Generate AI scripts based on your best-performing content",
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
  },
  {
    href: "/comments",
    icon: MessageSquareText,
    title: "Comment Mining",
    description: "Find what audiences love, hate, and want to see next",
    gradient: "from-pink-500/20 to-rose-500/10",
    iconColor: "text-pink-400",
  },
  {
    href: "/competitors",
    icon: Users,
    title: "Competitors",
    description: "Track channels in your niche and monitor what's trending",
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-400",
  },
  {
    href: "/thumbnails",
    icon: ImageIcon,
    title: "Thumbnail Studio",
    description: "Generate AI thumbnail concepts and images instantly",
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
  },
];

export default async function DashboardPage() {
  const user = await getUser();
  // Extract a readable first name: take part before first dot/+/_, strip trailing digits, capitalise
  function toFirstName(email: string | undefined): string {
    if (!email) return "there";
    const prefix = email.split("@")[0].split(/[.+_]/)[0].replace(/\d+$/, "");
    if (!prefix) return "there";
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  const firstName = toFirstName(user?.email);

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-2 animate-fade-up">
      {/* Hero greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Good to see you, <span className="gradient-text">{firstName}</span>
        </h1>
        <p className="text-white/40 mt-2 text-sm">
          What are we creating today?
        </p>
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickLinks.map(({ href, icon: Icon, title, description, gradient, iconColor }) => (
          <Link
            key={href}
            href={href}
            className="group relative rounded-2xl p-5 overflow-hidden block transition-all duration-200 hover:border-white/12"
            style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            }}
          >
            {/* Gradient blob */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 rounded-2xl transition-opacity duration-200 group-hover:opacity-100`} />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="font-semibold text-white/90 text-sm">{title}</p>
                  <p className="text-white/40 text-xs mt-1 leading-relaxed">{description}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Getting started */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(124, 58, 237, 0.06)",
          border: "1px solid rgba(124, 58, 237, 0.15)",
          backdropFilter: "blur(16px)",
        }}
      >
        <p className="text-sm font-semibold text-white/70 mb-4">Getting started</p>
        <div className="space-y-4">
          {[
            { step: 1, text: <>Use <Link href="/ideas" className="text-violet-400 hover:text-violet-300 font-medium">Idea Generator</Link> to get 20 proven video ideas for your niche in seconds.</> },
            { step: 2, text: <>Go to <Link href="/outliers" className="text-violet-400 hover:text-violet-300 font-medium">Outlier Detector</Link> — enter any channel handle to find their viral videos.</> },
            { step: 3, text: <>Pick a winner and hit <strong className="text-white/70">Script it</strong> to generate a full script, then jump to <Link href="/thumbnails" className="text-violet-400 hover:text-violet-300 font-medium">Thumbnail Studio</Link>.</> },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
              >
                {step}
              </span>
              <p className="text-sm text-white/50 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
