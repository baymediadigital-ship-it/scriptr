"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScriptrMark } from "@/components/ui/logo";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

const NICHES = [
  "Finance & Investing",
  "Health & Fitness",
  "Business & Entrepreneurship",
  "Tech & AI",
  "Gaming",
  "Entertainment",
  "Education",
  "Lifestyle & Vlogs",
  "Sports",
  "Food & Cooking",
  "Travel",
  "Other",
];

type Step = "channel" | "niche" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("channel");
  const [handle, setHandle] = useState("");
  const [channelName, setChannelName] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChannelSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const clean = handle.replace(/^@/, "").trim();
      const res = await fetch(`/api/youtube/channel?handle=${encodeURIComponent(clean)}`);
      if (!res.ok) throw new Error("Channel not found. Check the handle and try again.");
      const data = await res.json();
      setChannelName(data.title ?? clean);
      setStep("niche");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleNicheSubmit() {
    if (!niche) return;
    setLoading(true);

    try {
      // Save voice profile with channel + niche
      await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_name: channelName,
          niche,
          style_description: "",
          example_script: "",
          avoid_phrases: "",
        }),
      });

      // Mark onboarding complete
      await fetch("/api/onboarding/complete", { method: "POST" });

      setStep("done");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      // Even on error, mark done and proceed
      await fetch("/api/onboarding/complete", { method: "POST" }).catch(() => {});
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    await fetch("/api/onboarding/complete", { method: "POST" }).catch(() => {});
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-6 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <ScriptrMark size={36} />
          <span className="font-bold text-xl tracking-tight text-white" style={{ letterSpacing: "-0.03em" }}>Scriptr</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["channel", "niche"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: (step === s || step === "done" || (i === 0 && step === "niche"))
                    ? "#7c3aed"
                    : "rgba(255,255,255,0.15)",
                  transform: step === s ? "scale(1.4)" : "scale(1)",
                }}
              />
              {i < 1 && <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 animate-fade-up"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Step 1: Channel */}
          {step === "channel" && (
            <form onSubmit={handleChannelSubmit} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">What's your YouTube channel?</h1>
                <p className="text-white/40 text-sm">We'll use this to personalise your scripts and analysis.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">YouTube handle</label>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-sm pl-1">@</span>
                  <input
                    type="text"
                    placeholder="yourchannelhandle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
                    required
                    autoFocus
                    className="glass-input flex-1 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-sm text-white/25 hover:text-white/50 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={loading || !handle.trim()}
                  className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Niche */}
          {step === "niche" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">What type of content do you make?</h1>
                <p className="text-white/40 text-sm">Scriptr will tailor ideas and scripts to your niche.</p>
              </div>

              {/* Confirmed channel with edit option */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  <span className="text-sm text-white/80 font-medium">@{handle}</span>
                  {channelName !== handle && (
                    <span className="text-xs text-white/40">· {channelName}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setStep("channel"); setNiche(""); }}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {NICHES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNiche(n)}
                    className="px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150"
                    style={{
                      background: niche === n ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                      border: niche === n ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.07)",
                      color: niche === n ? "#c4b5fd" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep("channel")}
                  className="text-sm text-white/25 hover:text-white/50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNicheSubmit}
                  disabled={loading || !niche}
                  className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Let's go <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === "done" && (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-violet-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">You're all set!</h1>
              <p className="text-white/40 text-sm">Taking you to your dashboard…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
