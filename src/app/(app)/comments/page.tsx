"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MessageSquareText, TrendingUp, HelpCircle, Users, Quote, Loader2, ArrowRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

function extractVideoId(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("?")[0] || null;
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => ["shorts", "embed", "v"].includes(p));
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {}
  // bare video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  return null;
}

const SECTIONS = [
  { key: "WHAT THEY LOVED",                   icon: TrendingUp,        color: "#a78bfa" },
  { key: "FOLLOW-UP VIDEOS THEY'RE ASKING FOR", icon: FileText,         color: "#fb923c" },
  { key: "QUESTIONS & CONFUSION",              icon: HelpCircle,        color: "#60a5fa" },
  { key: "AUDIENCE INSIGHTS",                  icon: Users,             color: "#34d399" },
  { key: "STANDOUT QUOTES",                    icon: Quote,             color: "#f472b6" },
];

function cleanStream(raw: string): string {
  return raw
    .replace(/###[^\n]*/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^---+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseAnalysis(raw: string) {
  const result: Record<string, string> = {};
  for (const { key } of SECTIONS) {
    const regex = new RegExp(`###\\s*${key}\\s*\\n([\\s\\S]*?)(?=###|$)`, "i");
    const match = raw.match(regex);
    if (match) result[key] = match[1].trim();
  }
  return result;
}

function SectionCard({ title, content, icon: Icon, color }: { title: string; content: string; icon: any; color: string }) {
  const lines = content.split("\n").filter((l) => l.trim());
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0" style={{ color }} />
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{title}</p>
      </div>
      <div className="space-y-2">
        {lines
          .map((l) => l
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/\*([^*]+)\*/g, "$1")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/^---+$/, "")
            .trim()
          )
          .filter((l) => l.length > 0)
          .map((line, i) => {
            const clean = line.replace(/^[-•*\d.]\s*/, "").trim();
            if (!clean) return null;
            const isQuote = title === "STANDOUT QUOTES";
            return (
              <p
                key={i}
                className={`text-sm leading-relaxed ${isQuote ? "italic text-white/60" : "text-white/75"}`}
                style={isQuote ? { borderLeft: `2px solid ${color}`, paddingLeft: "12px" } : undefined}
              >
                {isQuote ? `"${clean.replace(/^[""]|[""]$/g, "")}"` : `• ${clean}`}
              </p>
            );
          })}
      </div>
    </div>
  );
}

export default function CommentsPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState("");
  const [done, setDone] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const accRef = useRef("");
  const progressRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [videoMeta, setVideoMeta] = useState<{ title: string; channel: string } | null>(null);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  async function analyze() {
    const id = extractVideoId(url);
    if (!id) { setError("Paste a valid YouTube URL or video ID."); return; }
    setLoading(true);
    setError(null);
    setRaw("");
    setDone(false);
    accRef.current = "";
    setVideoId(id);
    setVideoMeta(null);

    // Fetch video meta in background for display
    fetch(`/api/youtube/video?id=${id}`)
      .then((r) => r.json())
      .then((v) => setVideoMeta({ title: v.title, channel: v.channelTitle }))
      .catch(() => {});

    const EXPECTED = 6000;
    function tick() {
      if (progressRef.current) {
        const pct = Math.min(93, (accRef.current.length / EXPECTED) * 100);
        progressRef.current.style.width = `${pct}%`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    try {
      const res = await fetch("/api/comments/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: id }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Analysis failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        accRef.current += decoder.decode(value, { stream: true });
      }
      setRaw(accRef.current);
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      cancelAnimationFrame(rafRef.current);
      if (progressRef.current) progressRef.current.style.width = "100%";
      setLoading(false);
    }
  }

  const parsed = raw ? parseAnalysis(raw) : {};
  const renderedSections = SECTIONS.filter((s) => parsed[s.key]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Comment Mining</h1>
        <p className="text-white/40 mt-1 text-sm">
          Drop any YouTube URL — find what the audience loved, what they're asking for, and exactly what to make next.
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="https://youtu.be/... or youtube.com/watch?v=..."
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && analyze()}
          className="flex-1"
        />
        <button
          onClick={analyze}
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: loading ? "none" : "0 0 20px rgba(124,58,237,0.3)" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />}
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Video context banner */}
      {(loading || done) && videoMeta && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/80 truncate">{videoMeta.title}</p>
            <p className="text-xs text-white/35 mt-0.5">{videoMeta.channel}</p>
          </div>
          {done && (
            <button
              onClick={() => router.push(`/scripts?videoTitle=${encodeURIComponent(videoMeta.title)}&channelName=${encodeURIComponent(videoMeta.channel)}`)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 12px rgba(124,58,237,0.3)" }}
            >
              <FileText className="h-3.5 w-3.5" />
              Script it
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Loader2 className="h-3 w-3 animate-spin text-violet-400" /> Analyzing comments…
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div ref={progressRef} className="h-full rounded-full progress-stream" style={{ width: "0%", background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
          </div>
        </div>
      )}

      {/* Results: parsed sections fade in once after streaming */}
      {!loading && renderedSections.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          {renderedSections.map(({ key, icon, color }) => (
            <SectionCard key={key} title={key} content={parsed[key]} icon={icon} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}
