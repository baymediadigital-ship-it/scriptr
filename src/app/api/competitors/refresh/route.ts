import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChannelVideos } from "@/lib/youtube/client";
import { detectOutliers } from "@/lib/youtube/outlier";

// POST /api/competitors/refresh?channelId=xxx
// Fetches latest videos for a tracked channel and stores outlier scores in Supabase
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channelId = req.nextUrl.searchParams.get("channelId");
  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 });

  // Verify user tracks this channel
  const { data: tracked } = await supabase
    .from("tracked_channels")
    .select("id")
    .eq("user_id", user.id)
    .eq("channel_id", channelId)
    .single();

  if (!tracked) return NextResponse.json({ error: "Channel not tracked" }, { status: 404 });

  try {
    const videos = await getChannelVideos(channelId, 50);
    const { outliers, medianViews } = detectOutliers(videos);

    const outlierIds = new Set(outliers.map((v) => v.id));
    const outlierMap = new Map(outliers.map((v) => [v.id, v.outlierScore]));

    // Upsert all videos into channel_videos table
    const rows = videos.map((v) => ({
      channel_id: channelId,
      video_id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      view_count: v.viewCount,
      like_count: v.likeCount,
      comment_count: v.commentCount,
      published_at: v.publishedAt,
      duration: v.duration,
      outlier_score: outlierMap.get(v.id) ?? 1.0,
      is_outlier: outlierIds.has(v.id),
      channel_median_views: Math.round(medianViews),
      fetched_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from("channel_videos")
      .upsert(rows, { onConflict: "channel_id,video_id" });

    if (upsertError) throw new Error(upsertError.message);

    // Update last_checked_at
    await supabase
      .from("tracked_channels")
      .update({ last_checked_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("channel_id", channelId);

    return NextResponse.json({
      videosProcessed: videos.length,
      outliersFound: outliers.length,
      medianViews,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
