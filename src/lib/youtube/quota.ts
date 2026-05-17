import { createServiceClient as createClient } from "@/lib/supabase/service";

// YouTube Data API v3 costs per operation:
// channels.list (by id or handle): 1 unit
// search.list: 100 units
// playlistItems.list: 1 unit
// videos.list: 1 unit
// commentThreads.list: 1 unit
// Default daily quota: 10,000 units (pending increase to 500,000)

const DAILY_QUOTA = parseInt(process.env.YOUTUBE_DAILY_QUOTA ?? "10000");
const WARN_THRESHOLD = 0.80; // warn at 80%
const HARD_LIMIT = 0.95;     // block at 95% to keep headroom

export function getQuotaDate() {
  // YouTube quota resets at midnight Pacific Time
  const now = new Date();
  const pt = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  return pt.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function getQuotaUsage(): Promise<{ used: number; limit: number; date: string }> {
  const supabase = createClient();
  const date = getQuotaDate();

  const { data } = await supabase
    .from("youtube_quota")
    .select("units_used")
    .eq("date", date)
    .single();

  return { used: data?.units_used ?? 0, limit: DAILY_QUOTA, date };
}

export async function incrementQuota(units: number): Promise<void> {
  const supabase = createClient();
  const date = getQuotaDate();

  await supabase.rpc("increment_youtube_quota", {
    p_date: date,
    p_units: units,
  });
}

export async function checkQuota(unitsNeeded: number): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  pct: number;
  warning: boolean;
}> {
  const { used, limit } = await getQuotaUsage();
  const pct = used / limit;
  const projectedPct = (used + unitsNeeded) / limit;

  return {
    allowed: projectedPct < HARD_LIMIT,
    used,
    limit,
    pct,
    warning: pct >= WARN_THRESHOLD,
  };
}

// Unit costs for each operation — call these before making API requests
export const QUOTA_COSTS = {
  channelById: 1,
  channelByHandle: 1,
  searchChannels: 100,    // expensive!
  playlistItems: 1,       // per page
  videosList: 1,          // per batch of 50
  commentThreads: 1,
  // Full outlier search for 50 videos ≈ 1 (channel) + 1 (playlist, 1 page) + 1 (videos batch) = ~3 units
  outlierSearch: 3,
};
