"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ScriptrMark } from "@/components/ui/logo";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#08080f" }}>
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />

      <div className="text-center relative z-10 animate-fade-up">
        <div className="flex justify-center mb-6">
          <ScriptrMark size={48} />
        </div>

        <p className="text-5xl font-bold gradient-text mb-4">500</p>
        <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
        <p className="text-white/40 text-sm mb-8 max-w-xs mx-auto">
          An unexpected error occurred. We've been notified and are looking into it.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all btn-glow"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
