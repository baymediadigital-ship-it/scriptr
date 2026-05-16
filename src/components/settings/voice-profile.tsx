"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, Check } from "lucide-react";

export function VoiceProfile() {
  const [form, setForm] = useState({
    channel_name: "",
    niche: "",
    style_description: "",
    example_script: "",
    avoid_phrases: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/voice")
      .then((r) => r.json())
      .then((data) => {
        if (data) setForm({
          channel_name: data.channel_name ?? "",
          niche: data.niche ?? "",
          style_description: data.style_description ?? "",
          example_script: data.example_script ?? "",
          avoid_phrases: data.avoid_phrases ?? "",
        });
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2">
        <Mic className="h-4 w-4 text-violet-400" />
        <p className="text-sm font-semibold text-white/80">Your Voice Profile</p>
      </div>
      <p className="text-xs text-white/40 -mt-2">
        Train the AI to write scripts that sound like you. The more detail you add, the better the match.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-white/50">Channel name</Label>
          <Input
            placeholder="My YouTube Channel"
            value={form.channel_name}
            onChange={(e) => setForm({ ...form, channel_name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-white/50">Your niche</Label>
          <Input
            placeholder="e.g. personal finance, fitness, AI tools"
            value={form.niche}
            onChange={(e) => setForm({ ...form, niche: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-white/50">Describe your style</Label>
        <Textarea
          placeholder="e.g. Conversational and direct. I use short sentences and a lot of rhetorical questions. I'm brutally honest and use humor to make points land. I speak to busy professionals who want the truth fast."
          value={form.style_description}
          onChange={(e) => setForm({ ...form, style_description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-white/50">Paste an example script or intro <span className="text-white/25">(optional)</span></Label>
        <Textarea
          placeholder="Paste a few paragraphs from one of your best scripts so the AI can match your exact voice..."
          value={form.example_script}
          onChange={(e) => setForm({ ...form, example_script: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-white/50">Phrases / styles to avoid <span className="text-white/25">(optional)</span></Label>
        <Input
          placeholder="e.g. corporate jargon, filler phrases like 'In this video', clickbait"
          value={form.avoid_phrases}
          onChange={(e) => setForm({ ...form, avoid_phrases: e.target.value })}
        />
      </div>

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saved ? <><Check className="h-4 w-4" /> Saved</> : saving ? "Saving…" : "Save Voice Profile"}
      </Button>
    </div>
  );
}
