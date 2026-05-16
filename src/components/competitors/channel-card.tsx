"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { RefreshCw, Trash2, FileText, ArrowRight, Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface TrackedChannel {
  id: string;
  channel_id: string;
  channel_title: string;
  channel_thumbnail: string;
  subscriber_count: number;
  last_checked_at: string | null;
}

interface ChannelVideo {
  video_id: string;
  title: string;
  thumbnail: string;
  view_count: number;
  like_count: number;
  published_at: string;
  outlier_score: number;
  is_outlier: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
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

function VideoCard({ video, channelTitle, channelAvgViews, onScript }: {
  video: ChannelVideo;
  channelTitle: string;
  channelAvgViews: number;
  onScript: (v: ChannelVideo) => void;
}) {
  const score = video.outlier_score;
  const scoreColor =
    score >= 10 ? { bg: "rgba(234,179,8,0.15)",  text: "#fbbf24" } :
    score >= 3  ? { bg: "rgba(249,115,22,0.15)", text: "#fb923c" } :
                  { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa" };

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

    // rAF loop: render at 60fps decoupled from chunk rate
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
          videoId: video.video_id,
          title: video.title,
          channelTitle,
          viewCount: video.view_count,
          outlierScore: video.outlier_score,
          channelAvgViews,
          publishedAt: video.published_at,
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
      <div className="group flex gap-3 p-3 hover:border-white/10">
        {video.thumbnail && (
          <img src={video.thumbnail} alt={video.title} className="w-32 h-[72px] rounded-xl flex-shrink-0 object-cover" />
        )}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {video.is_outlier && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
              style={{ background: scoreColor.bg, color: scoreColor.text }}
            >
              {score}x
            </span>
          )}
          <p className="text-sm font-medium line-clamp-2 leading-tight text-white/90">{video.title}</p>
          <div className="flex gap-3 text-xs text-white/40">
            <span>{formatNumber(video.view_count)} views</span>
            <span>{timeAgo(video.published_at)}</span>
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
          {video.is_outlier && (
            <button
              onClick={fetchBreakdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Why?
              {showBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>

      {showBreakdown && (
        <div className="px-4 pb-5 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {loadingBreakdown && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <Loader2 className="h-3 w-3 animate-spin text-violet-400" /> Analyzing…
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div ref={progressRef} className="h-full rounded-full progress-stream" style={{ width: "0%", background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
              </div>
            </div>
          )}
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

export function ChannelCard({
  channel,
  onRemove,
}: {
  channel: TrackedChannel;
  onRemove: (channelId: string) => void;
}) {
  const router = useRouter();
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastChecked, setLastChecked] = useState(channel.last_checked_at);
  const [videoError, setVideoError] = useState<string | null>(null);

  function scriptVideo(video: ChannelVideo) {
    const params = new URLSearchParams({
      videoTitle: video.title,
      channelName: channel.channel_title,
      viewCount: String(video.view_count),
      outlierScore: String(video.outlier_score),
    });
    router.push(`/scripts?${params.toString()}`);
  }

  async function loadVideos() {
    setLoadingVideos(true);
    setVideoError(null);
    try {
      const res = await fetch(`/api/competitors/videos?channelId=${channel.channel_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load videos");
      setVideos(data);
    } catch (err: any) {
      setVideoError(err.message);
    } finally {
      setLoadingVideos(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetch(`/api/competitors/refresh?channelId=${channel.channel_id}`, { method: "POST" });
    await loadVideos();
    setLastChecked(new Date().toISOString());
    setRefreshing(false);
  }

  async function handleExpand() {
    if (!expanded && videos.length === 0) await loadVideos();
    setExpanded((v) => !v);
  }

  const outliers = videos.filter((v) => v.is_outlier);
  const avgViews = videos.length ? Math.round(videos.reduce((s, v) => s + v.view_count, 0) / videos.length) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {channel.channel_thumbnail && (
              <img src={channel.channel_thumbnail} alt={channel.channel_title} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="font-semibold text-sm">{channel.channel_title}</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(channel.subscriber_count)} subscribers
                {lastChecked && ` · checked ${timeAgo(lastChecked)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onRemove(channel.channel_id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <button
          onClick={handleExpand}
          className="w-full py-2 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 transition-all cursor-pointer"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {expanded ? "Hide videos" : "Show videos"}
        </button>

        {expanded && (
          loadingVideos ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          ) : videoError ? (
            <p className="text-sm text-destructive text-center py-4">{videoError}</p>
          ) : videos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No videos cached yet. Click ↻ to fetch from YouTube.
            </p>
          ) : (
            <Tabs defaultValue="outliers">
              <TabsList className="w-full">
                <TabsTrigger value="outliers" className="flex-1">Outliers ({outliers.length})</TabsTrigger>
                <TabsTrigger value="all" className="flex-1">All ({videos.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="outliers" className="space-y-2 mt-3">
                {outliers.length === 0
                  ? <p className="text-sm text-white/40 text-center py-2">No outliers found.</p>
                  : outliers.map((v) => <VideoCard key={v.video_id} video={v} channelTitle={channel.channel_title} channelAvgViews={avgViews} onScript={scriptVideo} />)}
              </TabsContent>
              <TabsContent value="all" className="space-y-2 mt-3">
                {videos.map((v) => <VideoCard key={v.video_id} video={v} channelTitle={channel.channel_title} channelAvgViews={avgViews} onScript={scriptVideo} />)}
              </TabsContent>
            </Tabs>
          )
        )}
      </CardContent>
    </Card>
  );
}
