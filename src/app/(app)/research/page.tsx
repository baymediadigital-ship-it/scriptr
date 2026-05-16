"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, PlayCircle, Globe, FileText, Plus } from "lucide-react";

interface Source {
  id: string;
  type: "youtube" | "url" | "text";
  title: string;
  source_url: string | null;
  char_count: number;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  youtube: <PlayCircle className="h-4 w-4 text-red-500" />,
  url: <Globe className="h-4 w-4 text-blue-500" />,
  text: <FileText className="h-4 w-4 text-green-500" />,
};

const TYPE_LABELS: Record<string, string> = {
  youtube: "YouTube",
  url: "Web URL",
  text: "Text",
};

function formatChars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k chars`;
  return `${n} chars`;
}

export default function ResearchPage() {
  // Sources
  const [sources, setSources] = useState<Source[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Ingest form
  const [ingestType, setIngestType] = useState<"youtube" | "url" | "text">("youtube");
  const [ingestInput, setIngestInput] = useState("");
  const [ingestTitle, setIngestTitle] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);

  // Q&A
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { loadSources(); }, []);

  async function loadSources() {
    setLoadingSources(true);
    const res = await fetch("/api/research/sources");
    if (res.ok) setSources(await res.json());
    setLoadingSources(false);
  }

  async function ingest() {
    if (!ingestInput.trim()) return;
    setIngesting(true);
    setIngestError(null);

    const res = await fetch("/api/research/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: ingestType,
        input: ingestInput.trim(),
        title: ingestTitle.trim() || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setIngestError(data.error);
    } else {
      setSources((prev) => [data, ...prev]);
      setIngestInput("");
      setIngestTitle("");
    }
    setIngesting(false);
  }

  async function deleteSource(id: string) {
    await fetch(`/api/research/sources?id=${id}`, { method: "DELETE" });
    setSources((prev) => prev.filter((s) => s.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(sources.map((s) => s.id)));
  }

  async function ask() {
    if (!question.trim() || !sources.length) return;
    setAsking(true);
    setAnswer("");
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/research/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          question: question.trim(),
          sourceIds: selectedIds.size ? [...selectedIds] : [],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: any) {
      if (err.name !== "AbortError") setAnswer(`Error: ${err.message}`);
    } finally {
      setAsking(false);
    }
  }

  const placeholder =
    ingestType === "youtube" ? "https://youtube.com/watch?v=... or video ID" :
    ingestType === "url" ? "https://example.com/article" :
    "Paste your notes, transcripts, or any text…";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Research Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Ingest YouTube transcripts, articles, and notes — then ask questions to generate script context.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingest panel */}
        <Card>
          <CardHeader><CardTitle className="text-base">Add source</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              {(["youtube", "url", "text"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setIngestType(t)}
                  className={`flex items-center justify-center gap-2 rounded-md border p-2 text-xs font-medium transition-colors ${
                    ingestType === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {TYPE_ICONS[t]}
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            {ingestType === "text" && (
              <div className="space-y-1">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. My research notes"
                  value={ingestTitle}
                  onChange={(e) => setIngestTitle(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label>{ingestType === "text" ? "Content" : "URL"}</Label>
              {ingestType === "text" ? (
                <Textarea
                  placeholder={placeholder}
                  rows={5}
                  value={ingestInput}
                  onChange={(e) => setIngestInput(e.target.value)}
                />
              ) : (
                <Input
                  placeholder={placeholder}
                  value={ingestInput}
                  onChange={(e) => setIngestInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && ingest()}
                />
              )}
            </div>

            {ingestError && (
              <p className="text-sm text-destructive">{ingestError}</p>
            )}

            <Button className="w-full" onClick={ingest} disabled={ingesting || !ingestInput.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              {ingesting ? "Extracting…" : "Add to library"}
            </Button>
          </CardContent>
        </Card>

        {/* Sources library */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Library ({sources.length})</CardTitle>
            {sources.length > 0 && (
              <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs">
                Select all
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loadingSources ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
              </div>
            ) : sources.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No sources yet. Add a YouTube video, URL, or paste text.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    onClick={() => toggleSelect(src.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedIds.has(src.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex-shrink-0">{TYPE_ICONS[src.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{src.title}</p>
                      <p className="text-xs text-muted-foreground">{formatChars(src.char_count)}</p>
                    </div>
                    {selectedIds.has(src.id) && (
                      <Badge className="text-xs flex-shrink-0">Selected</Badge>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSource(src.id); }}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Q&A panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Ask a question
            {selectedIds.size > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({selectedIds.size} source{selectedIds.size > 1 ? "s" : ""} selected)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="e.g. What are the key points I should cover? Summarize the main arguments. Give me 5 hook ideas based on this content."
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={ask}
              disabled={asking || !question.trim() || sources.length === 0}
            >
              {asking ? "Thinking…" : selectedIds.size > 0 ? `Ask (${selectedIds.size} sources)` : "Ask (all sources)"}
            </Button>
            {asking && (
              <Button variant="outline" onClick={() => abortRef.current?.abort()}>Stop</Button>
            )}
          </div>

          {answer && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{answer}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
