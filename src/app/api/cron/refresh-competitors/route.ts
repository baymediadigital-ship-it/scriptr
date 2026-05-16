import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChannelVideos } from "@/lib/youtube/client";
import { detectOutliers } from "@/lib/youtube/outlier";
import { resend } from "@/lib/email/client";

const ALERT_EMAIL = process.env.CRON_ALERT_EMAIL ?? process.env.INVITE_FROM_EMAIL ?? "onboarding@resend.dev";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data: channels, error } = await supabase
    .from("tracked_channels")
    .select("channel_id")
    .or(`last_checked_at.is.null,last_checked_at.lt.${sixHoursAgo}`);

  if (error) {
    await sendAlert("Cron DB error", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  const failures = [];

  for (const { channel_id } of channels ?? []) {
    try {
      const videos = await getChannelVideos(channel_id, 30);
      const { outliers, medianViews } = detectOutliers(videos);
      const outlierIds = new Set(outliers.map((v) => v.id));
      const outlierMap = new Map(outliers.map((v) => [v.id, v.outlierScore]));

      const rows = videos.map((v) => ({
        channel_id,
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

      await supabase
        .from("channel_videos")
        .upsert(rows, { onConflict: "channel_id,video_id" });

      await supabase
        .from("tracked_channels")
        .update({ last_checked_at: new Date().toISOString() })
        .eq("channel_id", channel_id);

      results.push({ channel_id, videos: videos.length, outliers: outliers.length });
    } catch (err: any) {
      failures.push({ channel_id, error: err.message });
      results.push({ channel_id, error: err.message });
    }
  }

  // Alert if more than half the channels failed
  if (failures.length > 0 && failures.length >= (channels?.length ?? 0) / 2) {
    await sendAlert(
      `Cron: ${failures.length}/${channels?.length} channels failed`,
      failures.map((f) => `${f.channel_id}: ${f.error}`).join("\n")
    );
  }

  return NextResponse.json({ processed: results.length, failures: failures.length, results });
}

async function sendAlert(subject: string, body: string) {
  try {
    await resend.emails.send({
      from: `Scriptr Alerts <${ALERT_EMAIL}>`,
      to: ALERT_EMAIL,
      subject: `[Scriptr Alert] ${subject}`,
      html: `<pre style="font-family:monospace">${body}</pre>`,
    });
  } catch {
    // Don't let alert failure crash the cron
  }
}
