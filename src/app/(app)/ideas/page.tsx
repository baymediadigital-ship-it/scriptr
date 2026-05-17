"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb, Sparkles, TrendingUp, BookOpen, List, Flame, Film, FileText, ArrowRight } from "lucide-react";

interface Idea {
  title: string;
  hook: string;
  angle: string;
  format: string;
  estimatedViews: "high" | "medium" | "evergreen";
}

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  tutorial: <BookOpen className="h-3.5 w-3.5" />,
  story: <Film className="h-3.5 w-3.5" />,
  listicle: <List className="h-3.5 w-3.5" />,
  case_study: <TrendingUp className="h-3.5 w-3.5" />,
  hot_take: <Flame className="h-3.5 w-3.5" />,
  documentary: <FileText className="h-3.5 w-3.5" />,
};

const VIEW_COLORS: Record<string, string> = {
  high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  evergreen: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const VIEW_LABELS: Record<string, string> = {
  high: "High potential",
  medium: "Steady views",
  evergreen: "Evergreen",
};

export default function IdeasPage() {
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("engaging");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bufferRef = useRef("");

  async function handleGenerate() {
    if (!niche.trim()) return;
    setLoading(true);
    setIdeas([]);
    setError("");
    bufferRef.current = "";

    try {
      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, tone, count: 50 }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to generate ideas");
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bufferRef.current += decoder.decode(value, { stream: true });

        // Try to parse partial JSON as it streams in
        try {
          const raw = bufferRef.current.trim();
          const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
          if (jsonStr.endsWith("]")) {
            const parsed = JSON.parse(jsonStr);
            setIdeas(parsed);
          }
        } catch {
          // Not complete JSON yet, keep buffering
        }
      }

      // Final parse — strip markdown code fences if present
      try {
        const raw = bufferRef.current.trim();
        const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        const match = jsonStr.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(match ? match[0] : jsonStr);
        setIdeas(parsed);
      } catch {
        setError("Failed to parse ideas. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function useIdea(idea: Idea) {
    const params = new URLSearchParams({ videoTitle: idea.title });
    window.location.href = `/scripts?${params.toString()}`;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Idea Generator</h1>
        <p className="text-white/40 mt-1 text-sm">
          50 proven video ideas for your niche — ready to script in minutes.
        </p>
      </div>

      {/* Input */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs text-white/50">Your niche</Label>
            <Input
              placeholder="e.g. personal finance, fitness over 40, AI tools..."
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Tone</Label>
            <Select value={tone} onValueChange={(v) => v && setTone(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engaging">Engaging</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="entertaining">Entertaining</SelectItem>
                <SelectItem value="inspirational">Inspirational</SelectItem>
                <SelectItem value="controversial">Controversial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading || !niche.trim()} className="gap-2">
          <Sparkles className="h-4 w-4" />
          {loading ? "Generating 50 ideas…" : "Generate Ideas"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Loading state */}
      {loading && ideas.length === 0 && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {/* Ideas grid */}
      {ideas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/40">{ideas.length} ideas generated</p>
            <div className="flex items-center gap-3 text-xs text-white/30">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400/60 inline-block" /> High potential</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400/60 inline-block" /> Steady</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400/60 inline-block" /> Evergreen</span>
            </div>
          </div>
          {ideas.map((idea, i) => (
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
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${VIEW_COLORS[idea.estimatedViews]}`}>
                      {VIEW_LABELS[idea.estimatedViews]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-white/35 capitalize">
                      {FORMAT_ICONS[idea.format]}
                      {idea.format?.replace("_", " ")}
                    </span>
                  </div>
                  <p className="font-semibold text-white/90 text-sm leading-snug">{idea.title}</p>
                  <p className="text-xs text-white/40 mt-1 leading-relaxed line-clamp-2">
                    <span className="text-white/25 mr-1">Hook:</span>{idea.hook}
                  </p>
                  <p className="text-xs text-violet-400/70 mt-0.5 line-clamp-1">
                    <span className="text-white/25 mr-1">Angle:</span>{idea.angle}
                  </p>
                </div>
                <button
                  onClick={() => useIdea(idea)}
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
