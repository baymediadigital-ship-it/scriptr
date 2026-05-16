"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { CheckoutButton } from "./checkout-button";
import type { BillingInterval } from "@/lib/stripe/client";

const FEATURES = [
  "Unlimited outlier searches",
  "Unlimited scripts",
  "Unlimited competitors",
  "Research assistant",
  "Thumbnail studio",
  "Priority support",
];

export function PlanToggle() {
  const [interval, setInterval] = useState<BillingInterval>("yearly");

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-center">
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {(["monthly", "yearly"] as BillingInterval[]).map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={
                interval === i
                  ? { background: "rgba(124,58,237,0.25)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.3)" }
                  : { color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }
              }
            >
              {i === "monthly" ? "Monthly" : "Yearly"}
              {i === "yearly" && (
                <span
                  className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(124,58,237,0.3)", color: "#a78bfa" }}
                >
                  Best value
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Free */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white/90">Free</p>
              <span className="text-xs text-white/40 font-medium">Current</span>
            </div>
            <p className="text-2xl font-bold mt-1">Free</p>
          </div>
          <ul className="space-y-2">
            {["10 outlier searches / mo", "5 scripts / mo", "2 tracked competitors", "Research assistant", "Thumbnail studio"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                <Check className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}
        >
          <div>
            <p className="font-semibold text-white/90">Pro</p>
            <p className="text-2xl font-bold mt-1">
              {interval === "monthly" ? "$29" : "$249"}
              <span className="text-sm font-normal text-white/40">
                {interval === "monthly" ? " /mo" : " /yr"}
              </span>
              {interval === "yearly" && (
                <span className="ml-2 text-sm font-normal text-white/40">($20.75/mo)</span>
              )}
            </p>
            <p className="text-xs text-violet-400 mt-0.5">
              {interval === "monthly"
                ? "$5 trial for 7 days, then $29/mo"
                : "$5 trial for 7 days, then $249/yr"}
            </p>
          </div>
          <ul className="space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                <Check className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="pt-1">
            <CheckoutButton variant="card" interval={interval} />
          </div>
        </div>
      </div>
    </div>
  );
}
