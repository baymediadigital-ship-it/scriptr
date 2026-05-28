import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getUser } from "@/lib/supabase/user";
import { createClient } from "@/lib/supabase/server";
import { searchVideosByNiche, getChannelVideos } from "@/lib/youtube/client";
import { detectOutliers } from "@/lib/youtube/outlier";
import { checkQuota, incrementQuota, QUOTA_COSTS } from "@/lib/youtube/quota";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { niche, includeCompetitors = true } = await req.json();

  if (!niche?.trim() && !includeCompetitors) {
    return NextResponse.json({ error: "Provide a niche or enable competitor analysis" }, { status: 400 });
  }

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quota = await checkQuota(niche?.trim() ? QUOTA_COSTS.trendingFormats : QUOTA_COSTS.outlierSearch);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "YouTube API quota reached for today. Resets at midnight Pacific Time.", quotaExhausted: true },
      { status: 429 }
    );
  }

  // ── 1. Gather videos with full metadata ────────────────────────────────────
  type VideoEntry = { id: string; title: string; channel: string; viewCount: number; thumbnail: string };
  const allVideos: VideoEntry[] = [];

  // Niche search
  if (niche?.trim()) {
    try {
      const videos = await searchVideosByNiche(niche.trim(), 40);
      for (const v of videos) {
        allVideos.push({
          id: v.id,
          title: v.title,
          channel: v.channel,
          viewCount: v.viewCount,
          thumbnail: `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
        });
      }
    } catch (e: any) {
      console.error("Niche search error:", e.message);
    }
  }

  // Competitor channels
  if (includeCompetitors) {
    const supabase = await createClient();
    const { data: tracked } = await supabase
      .from("tracked_channels")
      .select("channel_id, channel_title")
      .eq("user_id", user.id)
      .limit(8);

    if (tracked?.length) {
      await Promise.allSettled(
        tracked.map(async (ch) => {
          try {
            const videos = await getChannelVideos(ch.channel_id, 30);
            const { outliers } = detectOutliers(videos, { minOutlierScore: 1.5 });
            for (const v of outliers) {
              allVideos.push({
                id: v.id,
                title: v.title,
                channel: ch.channel_title,
                viewCount: v.viewCount,
                thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
              });
            }
          } catch {}
        })
      );
    }
  }

  if (allVideos.length === 0) {
    return NextResponse.json({ error: "No videos found. Try a different niche or add competitor channels." }, { status: 404 });
  }

  await incrementQuota(niche?.trim() ? QUOTA_COSTS.trendingFormats : QUOTA_COSTS.outlierSearch);

  // Build lookup map: id → video
  const videoMap: Record<string, VideoEntry> = {};
  for (const v of allVideos) videoMap[v.id] = v;

  // ── 2. Claude analysis ─────────────────────────────────────────────────────
  const sorted = [...allVideos].sort((a, b) => b.viewCount - a.viewCount).slice(0, 60);

  const titleBlock = sorted
    .map((v, i) => `${i + 1}. [id:${v.id}] "${v.title}" — ${v.channel} (${v.viewCount.toLocaleString()} views)`)
    .join("\n");

  const prompt = `You are a YouTube content strategist. Analyze these ${sorted.length} high-performing video titles${niche ? ` from the "${niche}" niche` : " from competitor channels"} and identify the top trending title formats/frameworks.

VIDEOS:
${titleBlock}

Identify the 5-7 most dominant title FORMATS (not topics) — the structural patterns and psychological triggers that keep appearing in top-performing videos.

Return a JSON array of objects with this exact shape:
[
  {
    "format": "Short name for the format (e.g. 'The Personal Experiment')",
    "template": "Reusable template with [BRACKETS] for variables (e.g. 'I Did [X] for [Timeframe] — Here\\'s What [Outcome]')",
    "trigger": "One word psychological trigger: curiosity | fomo | transformation | contrarian | challenge | insider knowledge",
    "why": "1-2 sentences on why this format is working right now",
    "exampleIds": ["video_id_from_list", "another_video_id_from_list"],
    "count": 4
  }
]

Rules:
- Focus on FORMAT/STRUCTURE not topic
- exampleIds must be real video IDs from the [id:xxx] tags in the list above (2-3 ids per format)
- count = how many videos in the list match this format pattern
- Sort by count descending
- Return ONLY the JSON array, no other text`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  let formats: any[] = [];
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found");
    formats = JSON.parse(match[0]);
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to parse AI response: ${e.message}` }, { status: 500 });
  }

  // ── 3. Enrich examples with full video data ────────────────────────────────
  const enriched = formats.map((f) => ({
    ...f,
    examples: (f.exampleIds ?? [])
      .map((id: string) => videoMap[id])
      .filter(Boolean)
      .slice(0, 3),
  }));

  return NextResponse.json({
    formats: enriched,
    meta: {
      total: allVideos.length,
      niche: allVideos.filter(v => !niche || true).length,
      analyzed: sorted.length,
    },
  });
}
