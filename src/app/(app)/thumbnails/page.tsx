"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Download, RefreshCw, ImageIcon, Loader2 } from "lucide-react";

interface Concept {
  name: string;
  imagePrompt: string;
  textOverlay: string;
  colors: string[];
  whyItWorks: string;
}

interface GeneratedImage {
  concept: Concept;
  url: string | null;
  loading: boolean;
  error: string | null;
}

const STYLES = [
  { value: "bold-face", label: "Bold face reaction" },
  { value: "cinematic", label: "Cinematic / dramatic" },
  { value: "minimalist", label: "Clean & minimalist" },
  { value: "before-after", label: "Before & after" },
  { value: "collage", label: "Multi-image collage" },
  { value: "text-heavy", label: "Text-heavy" },
];

const TONES = [
  { value: "shocking", label: "Shocking / surprising" },
  { value: "inspirational", label: "Inspirational" },
  { value: "curious", label: "Curiosity-driven" },
  { value: "humorous", label: "Humorous" },
  { value: "professional", label: "Professional" },
];

function parseConcepts(raw: string): Concept[] {
  const blocks = raw.split(/###\s*CONCEPT\s*\d+:/i).filter(Boolean);
  return blocks.map((block) => {
    const nameMatch = block.match(/^([^\n]+)/);
    const promptMatch = block.match(/\*\*Image prompt:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i);
    const textMatch = block.match(/\*\*Text overlay:\*\*\s*([^\n]+)/i);
    const colorsMatch = block.match(/\*\*Colors:\*\*\s*([^\n]+)/i);
    const whyMatch = block.match(/\*\*Why it works:\*\*\s*([^\n]+)/i);
    const colorStr = colorsMatch?.[1] ?? "";
    const colors = [...colorStr.matchAll(/#[0-9A-Fa-f]{3,6}/g)].map((m) => m[0]);
    return {
      name: nameMatch?.[1]?.trim() ?? "Concept",
      imagePrompt: promptMatch?.[1]?.trim() ?? "",
      textOverlay: textMatch?.[1]?.trim() ?? "",
      colors,
      whyItWorks: whyMatch?.[1]?.trim() ?? "",
    };
  }).filter((c) => c.imagePrompt);
}

function ThumbnailCard({ item, index, onRegenerate }: {
  item: GeneratedImage;
  index: number;
  onRegenerate: (index: number) => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Image area */}
      <div className="relative w-full" style={{ aspectRatio: "16/9", background: "rgba(0,0,0,0.3)" }}>
        {item.loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
            <p className="text-xs text-white/30">Generating image…</p>
          </div>
        )}
        {item.error && !item.loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <ImageIcon className="h-6 w-6 text-white/20" />
            <p className="text-xs text-red-400">{item.error}</p>
          </div>
        )}
        {item.url && !item.loading && (
          <img src={item.url} alt={item.concept.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Info + actions */}
      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-white/30 mb-0.5">Concept {index + 1}</p>
            <p className="font-semibold text-sm text-white/90">{item.concept.name}</p>
          </div>
          {item.concept.colors.length > 0 && (
            <div className="flex gap-1 mt-1">
              {item.concept.colors.slice(0, 3).map((c) => (
                <div key={c} className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0" style={{ backgroundColor: c }} title={c} />
              ))}
            </div>
          )}
        </div>

        {item.concept.textOverlay && (
          <div
            className="px-3 py-2 rounded-xl text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="font-bold text-white/90 text-sm">{item.concept.textOverlay}</p>
            <p className="text-[10px] text-white/25 mt-0.5 uppercase tracking-widest">Text overlay</p>
          </div>
        )}

        {item.concept.whyItWorks && (
          <p className="text-xs text-white/35 leading-relaxed">{item.concept.whyItWorks}</p>
        )}

        <div className="flex gap-2 pt-1">
          {item.url && (
            <a
              href={item.url}
              download="thumbnail.webp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 16px rgba(124,58,237,0.25)" }}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          )}
          <button
            onClick={() => onRegenerate(index)}
            disabled={item.loading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-white/70 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${item.loading ? "animate-spin" : ""}`} />
            {item.url ? "Regenerate" : "Retry"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ThumbnailsPage() {
  const searchParams = useSearchParams();
  const [videoTitle, setVideoTitle] = useState(() => searchParams.get("videoTitle") ?? "");
  const [description, setDescription] = useState(() => searchParams.get("description") ?? "");
  const [style, setStyle] = useState("bold-face");
  const [tone, setTone] = useState("shocking");

  const [phase, setPhase] = useState<"idle" | "concepts" | "images" | "done">("idle");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function generateImage(prompt: string): Promise<string | null> {
    const res = await fetch("/api/thumbnails/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Image generation failed");
    return data.url;
  }

  async function run() {
    if (!videoTitle.trim()) return;
    setError(null);
    setImages([]);
    setPhase("concepts");
    abortRef.current = new AbortController();

    // Step 1: stream concepts from Claude
    let rawConcepts = "";
    try {
      const res = await fetch("/api/thumbnails/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({ videoTitle, description, style, tone }),
      });
      if (!res.ok) throw new Error("Failed to generate concepts");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        rawConcepts += decoder.decode(value, { stream: true });
      }
    } catch (e: any) {
      if (e.name !== "AbortError") setError(e.message);
      setPhase("idle");
      return;
    }

    const concepts = parseConcepts(rawConcepts);
    if (!concepts.length) {
      setError("No concepts generated. Try again.");
      setPhase("idle");
      return;
    }

    // Step 2: generate images sequentially to avoid rate limits
    setPhase("images");
    const initial: GeneratedImage[] = concepts.map((c) => ({ concept: c, url: null, loading: false, error: null }));
    setImages(initial);

    for (let i = 0; i < concepts.length; i++) {
      setImages((prev) => prev.map((item, idx) => idx === i ? { ...item, loading: true } : item));
      try {
        const url = await generateImage(concepts[i].imagePrompt);
        setImages((prev) => prev.map((item, idx) => idx === i ? { ...item, url, loading: false } : item));
      } catch (e: any) {
        setImages((prev) => prev.map((item, idx) => idx === i ? { ...item, loading: false, error: e.message } : item));
      }
    }

    setPhase("done");
  }

  async function regenerate(index: number) {
    const concept = images[index]?.concept;
    if (!concept) return;
    setImages((prev) => prev.map((item, i) => i === index ? { ...item, loading: true, error: null, url: null } : item));
    try {
      const url = await generateImage(concept.imagePrompt);
      setImages((prev) => prev.map((item, i) => i === index ? { ...item, url, loading: false } : item));
    } catch (e: any) {
      setImages((prev) => prev.map((item, i) => i === index ? { ...item, loading: false, error: e.message } : item));
    }
  }

  const isRunning = phase === "concepts" || phase === "images";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Thumbnail Studio</h1>
        <p className="text-white/40 mt-1 text-sm">Generate 4 ready-to-download AI thumbnails for your video.</p>
      </div>

      {/* Input */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Video title *</Label>
            <Input
              placeholder="e.g. I Survived 30 Days on $1 a Day"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Short description (optional)</Label>
            <Input
              placeholder="Brief topic summary for better results"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Visual style</Label>
            <Select value={style} onValueChange={(v) => v && setStyle(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={(v) => v && setTone(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={run}
            disabled={isRunning || !videoTitle.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: isRunning ? "none" : "0 0 20px rgba(124,58,237,0.3)" }}
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {phase === "concepts" ? "Writing concepts…" : phase === "images" ? "Generating images…" : "Generate 4 thumbnails"}
          </button>
          {isRunning && (
            <button
              onClick={() => { abortRef.current?.abort(); setPhase("idle"); }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 transition-all cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Stop
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}
      </div>

      {/* Progress indicator */}
      {phase === "images" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.18)" }}>
          <Loader2 className="h-4 w-4 animate-spin text-violet-400 flex-shrink-0" />
          <p className="text-sm text-white/60">Cooking…</p>
        </div>
      )}

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((item, i) => (
            <ThumbnailCard key={i} item={item} index={i} onRegenerate={regenerate} />
          ))}
        </div>
      )}
    </div>
  );
}
