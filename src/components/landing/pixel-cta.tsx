"use client";

import { ArrowRight, Zap } from "lucide-react";

interface Props {
  variant?: "hero" | "pricing" | "footer";
  children?: React.ReactNode;
}

export function PixelCTA({ variant = "hero", children }: Props) {
  function handleClick() {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout");
    }
  }

  if (variant === "pricing") {
    return (
      <a
        href="/auth/signup"
        onClick={handleClick}
        className="block w-full text-center py-3 rounded-xl text-sm font-bold text-white transition-all"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 24px rgba(124,58,237,0.35)" }}
      >
        {children ?? "Start $5 trial →"}
      </a>
    );
  }

  if (variant === "footer") {
    return (
      <a
        href="/auth/signup"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 32px rgba(124,58,237,0.4)" }}
      >
        <Zap className="h-5 w-5" />
        {children ?? "Start your 7-day trial for $5"}
      </a>
    );
  }

  return (
    <a
      href="/auth/signup"
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all"
      style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 32px rgba(124,58,237,0.4)" }}
    >
      <Zap className="h-5 w-5" />
      {children ?? "Start $5 trial"}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}
