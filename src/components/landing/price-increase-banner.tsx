"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Zap } from "lucide-react";

function getTimeLeft(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, mins };
}

export function PriceIncreaseBanner({ dateStr }: { dateStr: string }) {
  const [dismissed, setDismissed] = useState(true); // start hidden, check localStorage
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number } | null>(null);
  const targetDate = new Date(dateStr);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDismissed = localStorage.getItem("scriptr_price_banner_dismissed");
    if (!isDismissed) setDismissed(false);

    const update = () => setTimeLeft(getTimeLeft(targetDate));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("scriptr_price_banner_dismissed", "1");
  }

  if (dismissed || !timeLeft) return null;

  return (
    <div
      className="relative w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm flex-wrap"
      style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.95), rgba(99,60,180,0.95))", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
    >
      <Zap className="h-3.5 w-3.5 text-yellow-300 flex-shrink-0" />
      <span className="text-white/90 font-medium">
        Price increases to <span className="text-white font-bold">$39/mo</span> in
      </span>

      {/* Countdown chips */}
      <div className="flex items-center gap-1.5">
        {timeLeft.days > 0 && (
          <span className="font-bold text-white px-2 py-0.5 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.15)" }}>
            {timeLeft.days}d
          </span>
        )}
        <span className="font-bold text-white px-2 py-0.5 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.15)" }}>
          {timeLeft.hours}h
        </span>
        <span className="font-bold text-white px-2 py-0.5 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.15)" }}>
          {timeLeft.mins}m
        </span>
      </div>

      <span className="text-white/70">—</span>
      <Link
        href="/auth/signup"
        className="font-bold text-white underline underline-offset-2 hover:text-yellow-200 transition-colors"
      >
        Lock in $29/mo forever →
      </Link>

      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
