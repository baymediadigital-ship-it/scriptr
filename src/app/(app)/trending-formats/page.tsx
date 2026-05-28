"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Sparkles, ArrowRight, Target, Users, Globe, Zap } from "lucide-react";

interface TrendingFormat {
  format: string;
  template: string;
  trigger: string;
  why: string;
  examples: string[];
  count: number;
}

const TRIGGER_COLORS: Record<string, string> = {
  curiosity:          "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  fomo:               "text-orange-400 bg-orange-500/10 border-orange-500/20",
  contrarian:         "text-red-400 bg-red-500/10 border-red-500/20",
  transformation:     "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "insider knowledge":"text-blue-400 bg-blue-500/10 border-blue-500/20",
  challenge:          "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

function getTriggerColor(trigger: string) {
  const lower = trigger.toLowerCase();
  for (const [key, cls] of Object.entries(TRIGGER_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  return "text-violet-400 bg-violet-500/10 border-violet-500/20";
}

const EXAMPLES = ["personal finance", "fitness", "chess", "true crime", "productivity", "AI tools"];

export default function TrendingFormatsPage() {
  const router = useRouter();
  const [niche, setNiche] = useState("");
  const [includeCompetitors, setIncludeCompetitors] = useState(true);
  const [formats, setFormats] = useState<TrendingFormat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<{ niche: number; competitor: number; total: number } | null>(null);
  const bufferRef = useRef("");

  async function handleAnalyze() {
    if (!niche.trim() && !includeCompetitors) return;
    setLoading(true);
    setFormats([]);
    setError("");
    setMeta(null);
    bufferRef.current = "";

    try {
      const res = await fetch("/api/trending-formats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, includeCompetitors }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to analyze formats");
        return;
      }

      setMeta({
        niche: parseInt(res.headers.get("X-Niche-Count") ?? "0"),
        competitor: parseInt(res.headers.get("X-Competitor-Count") ?? "0"),
        total: parseInt(res.headers.get("X-Title-Count") ?? "0"),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bufferRef.current += decoder.decode(value, { stream: true });
        try {
          const match = bufferRef.current.match(/\[[\s\S]*\]/);
          if (match && match[0].trim().endsWith("]")) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed)) setFormats(parsed);
          }
        } catch { /* keep buffering */ }
      }

      // Final parse
      try {
        const match = bufferRef.current.match(/\[[\s\S]*\]/);
        if (!match) throw new Error("No JSON found");
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) setFormats(parsed);
      } catch (e: any) {
        setError(`Failed to parse results: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function useFormat(template: string) {
    const params = new URLSearchParams({ prompt: template });
    router.push(`/ideas?${params.toString()}`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-5 w-5 text-violet-400" />
          <h1 className="text-2xl font-bold">Trending Formats</h1>
        </div>
        <p className="text-white/40 text-sm">
          Discover which title formats and structures are dominating right now — pulled from real YouTube data.
        </p>
      </div>

      {/* Input card */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="space-y-1.5">
          <Label className="text-xs text-white/50">Your niche <span className="text-white/25">(optional if using competitors)</span></Label>
          <Input
            placeholder="e.g. personal finance, fitness, AI tools, chess..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            className="text-sm"
          />
          <div className="flex gap-2 flex-wrap pt-1">
            {EXAMPLES.map((ex) => (
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
            style={{ background: includeCompetitors ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.05)", border: `1px solid ${includeCompetitors ? "transparent" : "rgba(255,255,255,0.15)"}` }}
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
      {loading && formats.length === 0 && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {/* Results */}
      {formats.length > 0 && (
        <div className="space-y-3">
          {/* Meta bar */}
          {meta && (
            <div className="flex items-center gap-4 flex-wrap text-xs text-white/30">
              <span className="font-medium text-white/50">{formats.length} trending formats identified</span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" /> {meta.niche} niche videos
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {meta.competitor} competitor outliers
              </span>
              <span className="text-white/20">from {meta.total} total titles analyzed</span>
            </div>
          )}

          {formats.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl p-5 space-y-3 transition-all duration-200 hover:border-white/12"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2.5">
                  {/* Format name + trigger + count */}
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

                  {/* Template */}
                  <div
                    className="rounded-xl px-3 py-2 font-mono text-xs text-violet-300/80"
                    style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
                  >
                    {f.template}
                  </div>

                  {/* Why it works */}
                  <p className="text-xs text-white/40 leading-relaxed">{f.why}</p>

                  {/* Examples */}
                  {f.examples?.length > 0 && (
                    <div className="space-y-1">
                      {f.examples.slice(0, 2).map((ex, j) => (
                        <p key={j} className="text-xs text-white/30 flex items-start gap-1.5">
                          <span className="text-violet-400/40 flex-shrink-0 mt-0.5">›</span>
                          <span className="italic">"{ex}"</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Use this format button */}
                <button
                  onClick={() => useFormat(f.template)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
                >
                  Use format <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
