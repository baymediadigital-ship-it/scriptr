import { NextRequest, NextResponse } from "next/server";
import { getChannelById, getChannelByHandle, getChannelVideos } from "@/lib/youtube/client";
import { analyzeChannel } from "@/lib/youtube/outlier";
import { getUser } from "@/lib/supabase/user";
import { getSubscription, isPro, getLimits } from "@/lib/billing/subscription";
import { getUsage, incrementUsage } from "@/lib/billing/usage";
import { checkQuota, incrementQuota, QUOTA_COSTS } from "@/lib/youtube/quota";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const channelId = searchParams.get("channelId");
  const handle = searchParams.get("handle");
  const maxResults = Math.min(parseInt(searchParams.get("maxResults") ?? "50"), 200);
  const minOutlierScore = parseFloat(searchParams.get("minScore") ?? "1.5");
  const minViews = parseInt(searchParams.get("minViews") ?? "0");

  if (!channelId && !handle) {
    return NextResponse.json(
      { error: "Provide ?channelId= or ?handle= parameter" },
      { status: 400 }
    );
  }

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check YouTube API quota before hitting Google
  const quota = await checkQuota(QUOTA_COSTS.outlierSearch);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: "YouTube API quota reached for today. Resets at midnight Pacific Time.",
        quotaExhausted: true,
        resetsAt: "midnight PT",
      },
      { status: 429 }
    );
  }

  const subscription = await getSubscription(user.id);
  if (!isPro(subscription)) {
    const usage = await getUsage(user.id);
    const limits = getLimits(subscription);
    if (usage.outlierSearches >= limits.outlierSearches) {
      return NextResponse.json(
        { error: "Monthly limit reached. Upgrade to Pro for unlimited searches.", limitReached: true },
        { status: 403 }
      );
    }
  }

  try {
    const channel = channelId
      ? await getChannelById(channelId)
      : await getChannelByHandle(handle!);

    const videos = await getChannelVideos(channel.id, maxResults);
    const analysis = analyzeChannel(channel, videos, { minOutlierScore, minViews });

    // Track quota and usage in parallel
    await Promise.all([
      incrementQuota(QUOTA_COSTS.outlierSearch),
      incrementUsage(user.id, "outlier_searches"),
    ]);

    return NextResponse.json({
      ...analysis,
      ...(quota.warning ? { quotaWarning: true, quotaUsed: quota.used, quotaLimit: quota.limit } : {}),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
