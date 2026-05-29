"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Sparkles, ArrowRight, Target, Users, Zap, Eye, ChevronDown } from "lucide-react";

interface VideoExample {
  id: string;
  title: string;
  channel: string;
  viewCount: number;
  thumbnail: string;
}

interface TrendingFormat {
  format: string;
  template: string;
  trigger: string;
  why: string;
  examples: VideoExample[];
  count: number;
}

const TRIGGER_COLORS: Record<string, string> = {
  curiosity:            "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  fomo:                 "text-orange-400 bg-orange-500/10 border-orange-500/20",
  contrarian:           "text-red-400 bg-red-500/10 border-red-500/20",
  transformation:       "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "insider knowledge":  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  challenge:            "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

function getTriggerColor(trigger: string) {
  const lower = trigger.toLowerCase();
  for (const [key, cls] of Object.entries(TRIGGER_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  return "text-violet-400 bg-violet-500/10 border-violet-500/20";
}

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const NICHE_EXAMPLES = ["personal finance", "fitness", "chess", "true crime", "productivity", "AI tools"];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "de", label: "German" },
  { code: "hi", label: "Hindi" },
  { code: "id", label: "Indonesian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "zh-Hans", label: "Chinese (Simplified)" },
];

const VIEW_THRESHOLDS = [
  { label: "10K+",  value: 10_000 },
  { label: "50K+",  value: 50_000 },
  { label: "100K+", value: 100_000 },
  { label: "500K+", value: 500_000 },
  { label: "1M+",   value: 1_000_000 },
];

export default function TrendingFormatsPage() {
  const router = useRouter();
  const [niche, setNiche] = useState("");
  const [includeCompetitors, setIncludeCompetitors] = useState(true);
  const [language, setLanguage] = useState("en");
  const [minViews, setMinViews] = useState(50_000);
  const [formats, setFormats] = useState<TrendingFormat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<{ total: number; analyzed: number } | null>(null);

  async function handleAnalyze() {
    if (!niche.trim() && !includeCompetitors) return;
    setLoading(true);
    setFormats([]);
    setError("");
    setMeta(null);

    try {
      const res = await fetch("/api/trending-formats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, includeCompetitors, language, minViews }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to analyze formats");
        return;
      }

      setFormats(data.formats ?? []);
      setMeta(data.meta ?? null);
    } finally {
      setLoading(false);
    }
  }

  function useFormat(template: string) {
    const params = new URLSearchParams({ prompt: template });
    router.push(`/ideas?${params.toString()}`);
  }

  const selectedLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-5 w-5 text-violet-400" />
          <h1 className="text-2xl font-bold">Trending Formats</h1>
        </div>
        <p className="text-white/40 text-sm">
          Discover which title formats are dominating right now — backed by real view counts and thumbnails.
        </p>
      </div>

      {/* Input card */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Niche */}
        <div className="space-y-1.5">
          <Label className="text-xs text-white/50">
            Your niche <span className="text-white/25">(optional if using competitors)</span>
          </Label>
          <Input
            placeholder="e.g. personal finance, fitness, AI tools, chess..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            className="text-sm"
          />
          <div className="flex gap-2 flex-wrap pt-1">
            {NICHE_EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setNiche(ex)}
                className="text-xs text-violet-400/70 hover:text-violet-400 transition-colors px-2 py-1 rounded-lg cursor-pointer"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Language + View threshold row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language */}
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Language</Label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full appearance-none rounded-xl px-3 py-2.5 text-sm text-white/80 cursor-pointer pr-8 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} style={{ background: "#1a1a2e" }}>
                    {l.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Min view threshold */}
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Minimum views</Label>
            <div className="flex gap-1.5 flex-wrap">
              {VIEW_THRESHOLDS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setMinViews(t.value)}
                  className="flex-1 min-w-0 px-2 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
                  style={{
                    background: minViews === t.value ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${minViews === t.value ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                    color: minViews === t.value ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Competitor toggle */}
        <button
          onClick={() => setIncludeCompetitors(!includeCompetitors)}
          className="flex items-center gap-3 w-full text-left p-3 rounded-xl transition-all cursor-pointer"
          style={{
            background: includeCompetitors ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${includeCompetitors ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.06)"}`,
          }}
        >
          <div
            className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: includeCompetitors ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${includeCompetitors ? "transparent" : "rgba(255,255,255,0.15)"}`,
            }}
          >
            {includeCompetitors && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <Users className="h-3.5 w-3.5 text-violet-400/70 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white/80">Include my tracked competitors</p>
            <p className="text-xs text-white/30">Surfaces formats beating the algorithm on channels you already follow</p>
          </div>
        </button>

        <Button
          onClick={handleAnalyze}
          disabled={loading || (!niche.trim() && !includeCompetitors)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Analyzing…" : "Find trending formats"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && formats.length > 0 && (
        <div className="space-y-3">
          {meta && (
            <p className="text-xs text-white/30">
              <span className="text-white/50 font-medium">{formats.length} trending formats</span>
              {" "}identified from{" "}
              <span className="text-white/50">{meta.analyzed} videos</span> analyzed
              {" · "}{selectedLang.label} · {VIEW_THRESHOLDS.find(t => t.value === minViews)?.label} views
            </p>
          )}

          {formats.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl p-5 space-y-4 transition-all duration-200 hover:border-white/12"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-white/25 font-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-semibold text-white/90 text-sm">{f.format}</span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getTriggerColor(f.trigger)}`}>
                    <Target className="h-2.5 w-2.5" />
                    {f.trigger}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/25">
                    <Zap className="h-3 w-3 text-yellow-400/50" />
                    {f.count} videos
                  </span>
                </div>
                <button
                  onClick={() => useFormat(f.template)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
                >
                  Use format <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Template */}
              <div
                className="rounded-xl px-3 py-2 font-mono text-xs text-violet-300/80"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
              >
                {f.template}
              </div>

              {/* Why */}
              <p className="text-xs text-white/40 leading-relaxed">{f.why}</p>

              {/* Video examples */}
              {f.examples?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20">Real examples</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {f.examples.map((v) => (
                      <a
                        key={v.id}
                        href={`https://youtube.com/watch?v=${v.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/card rounded-xl overflow-hidden transition-all hover:border-white/15"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                          <img
                            src={v.thumbnail}
                            alt={v.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div
                            className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-white"
                            style={{ background: "rgba(0,0,0,0.75)" }}
                          >
                            <Eye className="h-2.5 w-2.5" />
                            {formatViews(v.viewCount)}
                          </div>
                        </div>
                        <div className="p-2 space-y-0.5">
                          <p className="text-xs font-medium text-white/80 leading-snug line-clamp-2 group-hover/card:text-white transition-colors">
                            {v.title}
                          </p>
                          <p className="text-[10px] text-white/30">{v.channel}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
