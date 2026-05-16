"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Loader2, ImageIcon } from "lucide-react";
import type { ScriptFormat, ScriptTone } from "@/types/script";

function extractYouTubeId(input: string): string | null {
  try {
    const url = new URL(input.trim());
    // youtu.be/ID
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("?")[0] || null;
    // youtube.com/watch?v=ID or /shorts/ID or /embed/ID or /v/ID
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => ["shorts", "embed", "v"].includes(p));
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {}
  return null;
}

const FORMAT_OPTIONS: { value: ScriptFormat; label: string; description: string }[] = [
  { value: "pas", label: "Problem-Agitation-Solution", description: "Hook with a problem, amplify it, present your solution" },
  { value: "educational", label: "Educational / Tutorial", description: "Step-by-step teaching format with clear takeaways" },
  { value: "story", label: "Story-based", description: "Narrative arc — tension, struggle, resolution" },
  { value: "listicle", label: "Listicle (Top N)", description: "Ranked list format, save best for last" },
  { value: "documentary", label: "Documentary", description: "Journalistic, evidence-based storytelling" },
  { value: "review", label: "Review", description: "Systematic breakdown with pros, cons, verdict" },
];

const TONE_OPTIONS: { value: ScriptTone; label: string }[] = [
  { value: "conversational", label: "Conversational" },
  { value: "professional", label: "Professional" },
  { value: "energetic", label: "Energetic" },
  { value: "calm", label: "Calm & measured" },
  { value: "humorous", label: "Humorous" },
];

const LENGTH_OPTIONS = [
  { value: "short", label: "Short (~5 min)", words: "~800 words" },
  { value: "medium", label: "Medium (~10 min)", words: "~1,600 words" },
  { value: "long", label: "Long (~20 min)", words: "~3,000 words" },
];

function parseScript(raw: string) {
  const sections: Record<string, string> = {};
  const titleMatch = raw.match(/###\s*TITLE\s*\n([\s\S]*?)(?=###|$)/i);
  const hookMatch = raw.match(/###\s*HOOK[^\n]*\n([\s\S]*?)(?=###|$)/i);
  const bodyMatch = raw.match(/###\s*BODY\s*\n([\s\S]*?)(?=###|$)/i);
  const ctaMatch = raw.match(/###\s*CALL TO ACTION\s*\n([\s\S]*?)(?=###|---|$)/i);
  if (titleMatch) sections.title = titleMatch[1].trim();
  if (hookMatch) sections.hook = hookMatch[1].trim();
  if (bodyMatch) sections.body = bodyMatch[1].trim();
  if (ctaMatch) sections.cta = ctaMatch[1].trim();
  return sections;
}

export default function ScriptsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [videoTitle, setVideoTitle] = useState(() => searchParams.get("videoTitle") ?? "");
  const [videoDescription, setVideoDescription] = useState("");
  const [channelName, setChannelName] = useState(() => searchParams.get("channelName") ?? "");
  const [format, setFormat] = useState<ScriptFormat>("pas");
  const [tone, setTone] = useState<ScriptTone>("conversational");
  const [targetLength, setTargetLength] = useState<"short" | "medium" | "long">("medium");
  const [customInstructions, setCustomInstructions] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchedThumbnail, setFetchedThumbnail] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [rawScript, setRawScript] = useState("");
  const [done, setDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function handleTitleChange(value: string) {
    setVideoTitle(value);
    const videoId = extractYouTubeId(value);
    if (!videoId) return;
    setFetching(true);
    setFetchedThumbnail(null);
    try {
      const res = await fetch(`/api/youtube/video?id=${videoId}`);
      if (!res.ok) return;
      const video = await res.json();
      setVideoTitle(video.title ?? value);
      setChannelName(video.channelTitle ?? "");
      setVideoDescription(video.description ?? "");
      setFetchedThumbnail(video.thumbnail ?? null);
    } catch {}
    finally { setFetching(false); }
  }

  async function generate() {
    if (!videoTitle.trim()) return;
    setStreaming(true);
    setRawScript("");
    setDone(false);
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({ videoTitle, videoDescription, channelName, format, tone, targetLength, customInstructions }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        setRawScript((prev) => prev + decoder.decode(value, { stream: true }));
      }
      setDone(true);
    } catch (err: any) {
      if (err.name !== "AbortError") setRawScript(`Error: ${err.message}`);
    } finally {
      setStreaming(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  function goToThumbnails() {
    const params = new URLSearchParams({ videoTitle: videoTitle.trim() });
    if (videoDescription.trim()) params.set("description", videoDescription.trim());
    router.push(`/thumbnails?${params.toString()}`);
  }

  const parsed = rawScript ? parseScript(rawScript) : null;
  const wordCount = rawScript ? rawScript.split(/\s+/).filter(Boolean).length : 0;

  const outlierScore = searchParams.get("outlierScore");
  const viewCount = searchParams.get("viewCount");

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Script Writer</h1>
        <p className="text-white/40 mt-1 text-sm">Generate AI-powered scripts based on proven outlier videos.</p>
      </div>

      {outlierScore && videoTitle && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(249,115,22,0.15)", color: "#fb923c" }}
          >
            {outlierScore}x outlier
          </span>
          <span className="text-white/60 truncate">{videoTitle}</span>
          {viewCount && <span className="text-white/30 text-xs flex-shrink-0 ml-auto">{Number(viewCount).toLocaleString()} views</span>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <Card>
          <CardHeader><CardTitle className="text-base">Video context</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>YouTube URL or video title *</Label>
              <div className="relative">
                <Input
                  placeholder="Paste a YouTube URL or type a title…"
                  value={videoTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
                {fetching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-white/30" />
                  </div>
                )}
              </div>
              {fetchedThumbnail && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <img src={fetchedThumbnail} alt="" className="w-20 h-[45px] object-cover rounded-lg flex-shrink-0" />
                  <p className="text-xs text-white/50 line-clamp-2">{videoTitle}</p>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label>Channel name</Label>
              <Input
                placeholder="e.g. Mark Rober"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Video description (optional)</Label>
              <Textarea
                placeholder="Paste the video description for more context…"
                rows={3}
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings panel */}
        <Card>
          <CardHeader><CardTitle className="text-base">Script settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as ScriptFormat)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <p className="font-medium text-white/90">{o.label}</p>
                      <p className="text-xs text-white/40">{o.description}</p>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as ScriptTone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Length</Label>
              <div className="grid grid-cols-3 gap-2">
                {LENGTH_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setTargetLength(o.value as any)}
                    className={`rounded-md border p-2 text-center text-xs transition-colors ${
                      targetLength === o.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium">{o.label}</p>
                    <p className="opacity-70">{o.words}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Custom instructions (optional)</Label>
              <Textarea
                placeholder="e.g. Include a personal anecdote, target beginners…"
                rows={2}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={generate} disabled={streaming || !videoTitle.trim()}>
                {streaming ? "Generating…" : "Generate script"}
              </Button>
              {streaming && <Button variant="outline" onClick={stop}>Stop</Button>}
            </div>

            {videoTitle.trim() && !streaming && (
              <button
                onClick={goToThumbnails}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <ImageIcon className="h-4 w-4" />
                Generate thumbnail for this video
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Output */}
      {rawScript && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base">Generated script</CardTitle>
              {done && <Badge variant="outline" className="text-xs">{wordCount.toLocaleString()} words</Badge>}
              {streaming && <Badge className="text-xs animate-pulse">Writing…</Badge>}
            </div>
            {done && (
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(rawScript)}>
                Copy
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {parsed && (parsed.title || parsed.hook || parsed.body) ? (
              <Tabs defaultValue="formatted">
                <TabsList className="mb-4">
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted" className="space-y-6">
                  {parsed.title && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Title</p>
                      <p className="text-lg font-bold">{parsed.title}</p>
                    </div>
                  )}
                  {parsed.hook && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Hook (0:00–0:15)</p>
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                        <p className="text-sm whitespace-pre-wrap">{parsed.hook}</p>
                      </div>
                    </div>
                  )}
                  {parsed.body && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Body</p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{parsed.body}</p>
                    </div>
                  )}
                  {parsed.cta && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Call to Action</p>
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                        <p className="text-sm whitespace-pre-wrap">{parsed.cta}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="raw">
                  <pre className="text-sm whitespace-pre-wrap leading-relaxed font-mono bg-muted p-4 rounded-md overflow-auto max-h-[600px]">
                    {rawScript}
                  </pre>
                </TabsContent>
              </Tabs>
            ) : (
              <pre className="text-sm whitespace-pre-wrap leading-relaxed font-mono bg-muted p-4 rounded-md overflow-auto max-h-[600px]">
                {rawScript}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next step CTA after script is done */}
      {done && (
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl"
          style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <div>
            <p className="text-sm font-semibold text-white/80">Script done — now create your thumbnail</p>
            <p className="text-xs text-white/35 mt-0.5">Generate AI thumbnail concepts for this video in the Thumbnail Studio.</p>
          </div>
          <button
            onClick={goToThumbnails}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 20px rgba(124,58,237,0.35)" }}
          >
            <ImageIcon className="h-4 w-4" />
            Thumbnail Studio
          </button>
        </div>
      )}
    </div>
  );
}
