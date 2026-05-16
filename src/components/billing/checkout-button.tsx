"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import type { BillingInterval } from "@/lib/stripe/client";

interface Props {
  variant?: "default" | "card";
  interval?: BillingInterval;
}

export function CheckoutButton({ variant = "default", interval = "monthly" }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  if (variant === "card") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}
      >
        {loading ? "Redirecting…" : "Start $5 trial"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
      style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 16px rgba(124,58,237,0.3)" }}
    >
      <Zap className="h-4 w-4" />
      {loading ? "Redirecting…" : "Upgrade to Pro"}
    </button>
  );
}
