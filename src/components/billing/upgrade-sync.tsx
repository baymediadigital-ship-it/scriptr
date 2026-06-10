"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Fires once when the user lands on ?upgraded=true.
 * Calls /api/stripe/sync to pull the subscription from Stripe into Supabase,
 * then refreshes the page so the server component re-reads the updated plan.
 */
export function UpgradeSync() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      try {
        await fetch("/api/stripe/sync", { method: "POST" });
      } catch {
        // best-effort — webhook will handle it if this fails
      }
      if (!cancelled) {
        // Remove ?upgraded=true from URL and refresh server data
        router.replace("/settings");
        router.refresh();
      }
    }

    sync();
    return () => { cancelled = true; };
  }, [router]);

  return null;
}
