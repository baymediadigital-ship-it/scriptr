"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { ScriptrLogo } from "@/components/ui/logo";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "accepting" | "done" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setStatus("ready");
    });
  }, []);

  async function accept() {
    if (!user) {
      router.push(`/auth/login?next=/invite/${token}`);
      return;
    }
    setStatus("accepting");
    const res = await fetch("/api/team/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setStatus("error");
    } else {
      setStatus("done");
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#08080f" }}>
      <div
        className="w-full max-w-md rounded-2xl p-8 space-y-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-2">
          <ScriptrLogo />
        </div>

        {status === "loading" && (
          <div className="flex items-center gap-2 text-white/40 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {(status === "ready" || status === "accepting") && (
          <>
            <div>
              <h1 className="text-xl font-bold text-white mb-1">You've been invited</h1>
              <p className="text-sm text-white/50">
                Accept this invitation to join a Scriptr Pro workspace. You'll get full access to all Pro features.
              </p>
            </div>

            {user ? (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "rgba(124,58,237,0.3)" }}>
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="text-white/70">{user.email}</span>
              </div>
            ) : (
              <p className="text-sm text-white/40">You'll be asked to sign in or create an account.</p>
            )}

            <button
              onClick={accept}
              disabled={status === "accepting"}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all cursor-pointer"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 24px rgba(124,58,237,0.3)" }}
            >
              {status === "accepting" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {status === "accepting" ? "Joining…" : user ? "Accept invitation" : "Sign in to accept"}
            </button>
          </>
        )}

        {status === "done" && (
          <div className="text-center space-y-3 py-4">
            <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
            <p className="font-semibold text-white">You've joined the team!</p>
            <p className="text-sm text-white/40">Redirecting to your dashboard…</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-3 py-4">
            <XCircle className="h-10 w-10 text-red-400 mx-auto" />
            <p className="font-semibold text-white">Invite error</p>
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              Go to dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
