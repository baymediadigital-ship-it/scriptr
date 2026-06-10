"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import type { BillingInterval } from "@/lib/stripe/client";

interface Props {
  variant?: "default" | "card";
  interval?: BillingInterval;
  className?: string;
}

export function CheckoutButton({ variant = "default", interval = "monthly", className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Error ${res.status}`);
        return;
      }
      if (data.url) window.location.href = data.url;
      else setError("No checkout URL returned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "card") {
    return (
      <div className="space-y-2">
        <button
          onClick={handleClick}
          disabled={loading}
          className={`w-full py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50${className ? ` ${className}` : ""}`}
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}
        >
          {loading ? "Redirecting…" : "Start $5 trial"}
        </button>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50${className ? ` ${className}` : ""}`}
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 16px rgba(124,58,237,0.3)" }}
      >
        <Zap className="h-4 w-4" />
        {loading ? "Redirecting…" : "Upgrade to Pro"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
