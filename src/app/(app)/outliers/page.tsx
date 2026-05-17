"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChannelAnalysis, OutlierVideo } from "@/types/youtube";
import { FileText, TrendingUp, Users, BarChart2, ArrowRight, Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const LABEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  mega:     { bg: "rgba(234,179,8,0.15)",  text: "#fbbf24", label: "Mega" },
  high:     { bg: "rgba(249,115,22,0.15)", text: "#fb923c", label: "High" },
  moderate: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa", label: "Moderate" },
  normal:   { bg: "rgba(255,255,255,0.06)",text: "rgba(255,255,255,0.35)", label: "Normal" },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const BREAKDOWN_SECTIONS = [
  "TITLE FORMULA", "TOPIC ANGLE", "AUDIENCE PSYCHOLOGY",
  "WHAT THE COMMENTS REVEAL", "HOW TO REPLICATE THIS", "RISK FACTORS",
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

function parseBreakdown(raw: string) {
  const result: Record<string, string> = {};
  for (const key of BREAKDOWN_SECTIONS) {
    const regex = new RegExp(`###\\s*${key}\\s*\\n([\\s\\S]*?)(?=###|$)`, "i");
    const match = raw.match(regex);
    if (match) result[key] = match[1].trim();
  }
  return result;
}

function OutlierCard({ video, onScript, channelTitle }: { video: OutlierVideo; onScript: (v: OutlierVideo) => void; channelTitle?: string }) {
  const style = LABEL_STYLES[video.performanceLabel] ?? LABEL_STYLES.normal;
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState("");
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const accRef = useRef("");
  const progressRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  async function fetchBreakdown() {
    if (breakdown) { setShowBreakdown((v) => !v); return; }
    setShowBreakdown(true);
    setLoadingBreakdown(true);
    accRef.current = "";

    const EXPECTED = 4800;
    function tick() {
      if (progressRef.current) {
        const pct = Math.min(93, (accRef.current.length / EXPECTED) * 100);
        progressRef.current.style.width = `${pct}%`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    try {
      const res = await fetch("/api/youtube/viral-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.id,
          title: video.title,
          channelTitle: channelTitle ?? "",
          viewCount: video.viewCount,
          outlierScore: video.outlierScore,
          channelAvgViews: video.channelAvgViews,
          publishedAt: video.publishedAt,
        }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accRef.current += decoder.decode(value, { stream: true });
      }
      setBreakdown(accRef.current);
    } catch {}
    cancelAnimationFrame(rafRef.current);
    if (progressRef.current) progressRef.current.style.width = "100%";
    setLoadingBreakdown(false);
  }

  const parsed = breakdown ? parseBreakdown(breakdown) : {};

  return (
    <div
      className="rounded-2xl transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="group flex gap-4 p-4 hover:border-white/10">
        {video.thumbnail && (
          <img src={video.thumbnail} alt={video.title} className="w-36 h-[81px] object-cover rounded-xl flex-shrink-0" />
        )}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: style.bg, color: style.text }}>
              {video.outlierScore}x · {style.label}
            </span>
          </div>
          <p className="font-semibold text-sm leading-tight line-clamp-2 text-white/90">{video.title}</p>
          <div className="flex gap-4 text-xs text-white/40 flex-wrap">
            <span>{formatNumber(video.viewCount)} views</span>
            <span>{formatNumber(video.likeCount)} likes</span>
            <span>{video.daysOld < 7 ? `${video.daysOld}d ago` : video.daysOld < 30 ? `${Math.round(video.daysOld / 7)}w ago` : video.daysOld < 365 ? `${Math.round(video.daysOld / 30)}mo ago` : `${Math.round(video.daysOld / 365)}y ago`}</span>
            <span className="text-white/25">median: {formatNumber(Math.round(video.channelAvgViews))}</span>
          </div>
        </div>
        <div className="flex-shrink-0 self-center flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={() => onScript(video)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 16px rgba(124,58,237,0.3)" }}
          >
            <FileText className="h-3.5 w-3.5" />
            Script it
            <ArrowRight className="h-3 w-3" />
          </button>
          <button
            onClick={fetchBreakdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Why?
            {showBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Viral breakdown panel */}
      {showBreakdown && (
        <div className="px-4 pb-5 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {loadingBreakdown && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-white/30">
                <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin text-violet-400" /> Analyzing…</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div ref={progressRef} className="h-full rounded-full progress-stream" style={{ width: "0%", background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
              </div>
            </div>
          )}

          {/* After streaming: parsed sections fade in once */}
          {!loadingBreakdown && breakdown && (
            <div className="space-y-4 animate-fade-in">
              {Object.entries(parsed).map(([key, content]) => (
                <div key={key}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">{key}</p>
                  <div className="space-y-1.5">
                    {content.split("\n")
                      .map((l) => l
                        .replace(/\*\*([^*]+)\*\*/g, "$1")
                        .replace(/\*([^*]+)\*/g, "$1")
                        .replace(/`([^`]+)`/g, "$1")
                        .replace(/^---+$/, "")
                        .trim()
                      )
                      .filter((l) => l.length > 0)
                      .map((line, i) => (
                        <p key={i} className="text-sm text-white/65 leading-relaxed">
                          {/^[-•]/.test(line) ? line.replace(/^[-•]\s*/, "• ") : `• ${line}`}
                        </p>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VideoCard({ video, onScript }: { video: OutlierVideo | import("@/types/youtube").YouTubeVideo; onScript: (v: OutlierVideo | import("@/types/youtube").YouTubeVideo) => void }) {
  return (
    <div
      className="group flex gap-4 p-4 rounded-2xl transition-all duration-200 hover:border-white/10"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {video.thumbnail && (
        <img src={video.thumbnail} alt={video.title} className="w-36 h-[81px] object-cover rounded-xl flex-shrink-0" />
      )}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <p className="font-semibold text-sm line-clamp-2 text-white/90">{video.title}</p>
        <div className="flex gap-4 text-xs text-white/40">
          <span>{formatNumber(video.viewCount)} views</span>
          <span>{formatNumber(video.likeCount)} likes</span>
          <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
      <button
        onClick={() => onScript(video)}
        className="flex-shrink-0 self-center flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <FileText className="h-3.5 w-3.5" />
        Script
      </button>
    </div>
  );
}

export default function OutliersPage() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ChannelAnalysis | null>(null);
  const [tab, setTab] = useState<"outliers" | "popular" | "all">("outliers");

  async function analyzeHandle(h: string) {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await fetch(`/api/youtube/outliers?handle=${encodeURIComponent(h.trim())}&maxResults=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setAnalysis(data);
      setTab("outliers");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function analyze() {
    if (!handle.trim()) return;
    analyzeHandle(handle);
  }


  function scriptVideo(video: OutlierVideo | import("@/types/youtube").YouTubeVideo) {
    const params = new URLSearchParams({
      videoTitle: video.title,
      channelName: analysis?.channel.title ?? "",
      viewCount: String(video.viewCount),
      outlierScore: String("outlierScore" in video ? video.outlierScore : 0),
    });
    router.push(`/scripts?${params.toString()}`);
  }

  const NICHES = [
    {
      label: "Tech", channels: [
        { name: "MKBHD", handle: "@mkbhd" },
        { name: "Linus Tech Tips", handle: "@LinusTechTips" },
        { name: "Marques", handle: "@UnboxTherapy" },
        { name: "Dave2D", handle: "@Dave2D" },
      ],
    },
    {
      label: "Finance", channels: [
        { name: "Graham Stephan", handle: "@GrahamStephan" },
        { name: "Andrei Jikh", handle: "@AndreJikh" },
        { name: "Nate O'Brien", handle: "@NateOBrien" },
        { name: "Meet Kevin", handle: "@MeetKevin" },
      ],
    },
    {
      label: "Fitness", channels: [
        { name: "AthleanX", handle: "@athleanx" },
        { name: "Jeff Nippard", handle: "@JeffNippard" },
        { name: "Chris Heria", handle: "@ChrisHeria" },
        { name: "Jeremy Ethier", handle: "@JeremyEthier" },
      ],
    },
    {
      label: "Business", channels: [
        { name: "Alex Hormozi", handle: "@AlexHormozi" },
        { name: "Patrick Bet-David", handle: "@patrickbetdavid" },
        { name: "Gary Vee", handle: "@garyvee" },
        { name: "My First Million", handle: "@MyFirstMillionPod" },
      ],
    },
    {
      label: "Food", channels: [
        { name: "Joshua Weissman", handle: "@JoshuaWeissman" },
        { name: "Babish", handle: "@bingingwithbabish" },
        { name: "Ethan Chlebowski", handle: "@EthanChlebowski" },
        { name: "Internet Shaquille", handle: "@internetshaquille" },
      ],
    },
    {
      label: "Education", channels: [
        { name: "Veritasium", handle: "@veritasium" },
        { name: "Kurzgesagt", handle: "@kurzgesagt" },
        { name: "3Blue1Brown", handle: "@3blue1brown" },
        { name: "Mark Rober", handle: "@MarkRober" },
      ],
    },
  ];

  const tabs = [
    { key: "outliers", label: `Outliers (${analysis?.outliers.length ?? 0})` },
    { key: "popular", label: "Most Popular" },
    { key: "all", label: `All Videos (${analysis?.videos.length ?? 0})` },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Outlier Detector</h1>
        <p className="text-white/40 mt-1 text-sm">Find videos getting 2x–10x more views than the channel average.</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="YouTube handle (e.g. @mkbhd)"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && analyze()}
          className="max-w-sm"
        />
        <Button onClick={analyze} disabled={loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Niche explorer — only when idle */}
      {!analysis && !loading && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Explore a niche</p>
          <div className="space-y-3">
            {NICHES.map((niche) => (
              <div key={niche.label} className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-medium text-white/30 w-16 flex-shrink-0">{niche.label}</span>
                <div className="flex gap-2 flex-wrap">
                  {niche.channels.map((ch) => (
                    <button
                      key={ch.handle}
                      onClick={() => { setHandle(ch.handle); analyzeHandle(ch.handle); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.12)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.3)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                      }}
                    >
                      {ch.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
          </div>
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
      )}

      {analysis && !loading && (
        <>
          {/* Channel header */}
          <div className="flex items-center gap-4">
            {analysis.channel.thumbnail && (
              <img src={analysis.channel.thumbnail} alt={analysis.channel.title} className="w-12 h-12 rounded-full" />
            )}
            <div>
              <h2 className="text-lg font-bold">{analysis.channel.title}</h2>
              <p className="text-sm text-white/40">{analysis.channel.customUrl ?? ""}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Users, label: "Subscribers", value: formatNumber(analysis.channel.subscriberCount) },
              { icon: BarChart2, label: "Videos Analyzed", value: analysis.videos.length },
              { icon: TrendingUp, label: "Median Views", value: formatNumber(analysis.medianViews) },
              { icon: FileText, label: "Outliers Found", value: analysis.outliers.length, highlight: true },
            ].map(({ icon: Icon, label, value, highlight }) => (
              <div
                key={label}
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-xs text-white/35 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${highlight ? "text-orange-400" : "text-white/90"}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
                style={tab === t.key
                  ? { background: "rgba(124,58,237,0.2)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.3)" }
                  : { color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Video list */}
          <div className="space-y-2">
            {tab === "outliers" && (
              analysis.outliers.length === 0
                ? <p className="text-white/40 text-sm">No outliers found.</p>
                : analysis.outliers.map((v) => <OutlierCard key={v.id} video={v} onScript={scriptVideo} channelTitle={analysis.channel.title} />)
            )}
            {tab === "popular" && (
              [...analysis.videos]
                .sort((a, b) => b.viewCount - a.viewCount)
                .slice(0, 10)
                .map((v, i) => (
                  <div key={v.id} className="flex items-center gap-3">
                    <span className="text-2xl font-bold w-8 text-right flex-shrink-0" style={{ color: i < 3 ? "#a78bfa" : "rgba(255,255,255,0.15)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <VideoCard video={v} onScript={scriptVideo} />
                    </div>
                  </div>
                ))
            )}
            {tab === "all" && (
              [...analysis.videos]
                .sort((a, b) => b.viewCount - a.viewCount)
                .map((v) => <VideoCard key={v.id} video={v} onScript={scriptVideo} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}
