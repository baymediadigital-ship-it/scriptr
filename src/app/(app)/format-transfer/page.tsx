"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shuffle, Sparkles, ArrowRight, Zap, Brain, Target } from "lucide-react";

interface TransferResult {
  title: string;
  formula: string;
  trigger: string;
  angle: string;
}

const TRIGGER_COLORS: Record<string, string> = {
  curiosity: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  fomo: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  contrarian: "text-red-400 bg-red-500/10 border-red-500/20",
  transformation: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "insider knowledge": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  challenge: "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

function getTriggerColor(trigger: string): string {
  const lower = trigger.toLowerCase();
  for (const [key, cls] of Object.entries(TRIGGER_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  return "text-violet-400 bg-violet-500/10 border-violet-500/20";
}

const EXAMPLES = [
  { viralTitle: "I Watched Every LeBron Game This Season — Here's What Nobody Noticed", sourceNiche: "NBA", targetNiche: "Formula 1" },
  { viralTitle: "The $0 Training Plan That Beat Every Pro Athlete", sourceNiche: "Fitness", targetNiche: "Chess" },
  { viralTitle: "Why 99% of Investors Get This Completely Wrong", sourceNiche: "Finance", targetNiche: "Cooking" },
];

export default function FormatTransferPage() {
  const router = useRouter();
  const [viralTitle, setViralTitle] = useState("");
  const [sourceNiche, setSourceNiche] = useState("");
  const [targetNiche, setTargetNiche] = useState("");
  const [results, setResults] = useState<TransferResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bufferRef = useRef("");

  async function handleTransfer() {
    if (!viralTitle.trim() || !targetNiche.trim()) return;
    setLoading(true);
    setResults([]);
    setError("");
    bufferRef.current = "";

    try {
      const res = await fetch("/api/format-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viralTitle, sourceNiche, targetNiche }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to transfer format");
        return;
      }

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
            if (Array.isArray(parsed)) setResults(parsed);
          }
        } catch {
          // keep buffering
        }
      }

      // Final parse
      try {
        const match = bufferRef.current.match(/\[[\s\S]*\]/);
        if (!match) throw new Error("No JSON array found");
        const parsed = JSON.parse(match[0]);
        if (!Array.isArray(parsed)) throw new Error("Not an array");
        setResults(parsed);
      } catch (e: any) {
        setError(`Failed to parse results: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function useTitle(title: string) {
    const params = new URLSearchParams({ videoTitle: title });
    router.push(`/scripts?${params.toString()}`);
  }

  function loadExample(ex: typeof EXAMPLES[0]) {
    setViralTitle(ex.viralTitle);
    setSourceNiche(ex.sourceNiche);
    setTargetNiche(ex.targetNiche);
    setResults([]);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shuffle className="h-5 w-5 text-violet-400" />
          <h1 className="text-2xl font-bold">Format Transfer</h1>
        </div>
        <p className="text-white/40 text-sm">
          Take a proven title formula from any niche and adapt it to yours. Same psychological trigger, new audience.
        </p>
      </div>

      {/* Input card */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="space-y-1.5">
          <Label className="text-xs text-white/50">Viral title to adapt</Label>
          <Input
            placeholder="e.g. I Watched Every LeBron Game This Season — Here's What Nobody Noticed"
            value={viralTitle}
            onChange={(e) => setViralTitle(e.target.value)}
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Source niche <span className="text-white/25">(optional)</span></Label>
            <Input
              placeholder="e.g. NBA, fitness, personal finance..."
              value={sourceNiche}
              onChange={(e) => setSourceNiche(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Your niche</Label>
            <Input
              placeholder="e.g. Formula 1, chess, cooking..."
              value={targetNiche}
              onChange={(e) => setTargetNiche(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTransfer()}
            />
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button
            onClick={handleTransfer}
            disabled={loading || !viralTitle.trim() || !targetNiche.trim()}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Transferring format…" : "Transfer Format"}
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/25">Try an example:</span>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => loadExample(ex)}
                className="text-xs text-violet-400/70 hover:text-violet-400 transition-colors px-2 py-1 rounded-lg cursor-pointer"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
              >
                {ex.sourceNiche} → {ex.targetNiche}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && results.length === 0 && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/40">{results.length} adapted titles for <span className="text-white/70">{targetNiche}</span></p>
          </div>

          {/* Formula breakdown card */}
          {results[0] && (
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)" }}
            >
              <div className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Formula detected</span>
              </div>
              <p className="text-sm font-semibold text-white/80">{results[0].formula}</p>
              <p className="text-xs text-white/45 leading-relaxed">{results[0].trigger}</p>
            </div>
          )}

          {results.map((r, i) => (
            <div
              key={i}
              className="group rounded-2xl p-4 transition-all duration-200 hover:border-white/12"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs text-white/25 font-mono">{String(i + 1).padStart(2, "0")}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getTriggerColor(r.trigger)}`}
                    >
                      <Target className="h-2.5 w-2.5" />
                      {r.formula}
                    </span>
                  </div>
                  <p className="font-semibold text-white/90 text-sm leading-snug mb-1.5">{r.title}</p>
                  <p className="text-xs text-violet-400/60 leading-relaxed line-clamp-2">
                    <span className="text-white/25 mr-1">Angle:</span>{r.angle}
                  </p>
                </div>
                <button
                  onClick={() => useTitle(r.title)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
                >
                  Script it <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
