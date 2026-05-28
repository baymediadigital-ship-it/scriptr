import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getUser } from "@/lib/supabase/user";
import { createClient } from "@/lib/supabase/server";
import { searchVideosByNiche, getChannelVideos, getChannelById } from "@/lib/youtube/client";
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

  // ── 1. Gather titles ────────────────────────────────────────────────────────
  const nicheTitles: { title: string; channel: string; viewCount: number }[] = [];
  const competitorTitles: { title: string; channel: string; viewCount: number }[] = [];

  // Niche search
  if (niche?.trim()) {
    try {
      const videos = await searchVideosByNiche(niche.trim(), 40);
      nicheTitles.push(...videos.map(v => ({ title: v.title, channel: v.channel, viewCount: v.viewCount })));
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
            competitorTitles.push(
              ...outliers.map(v => ({ title: v.title, channel: ch.channel_title, viewCount: v.viewCount }))
            );
          } catch {}
        })
      );
    }
  }

  const allTitles = [...nicheTitles, ...competitorTitles];

  if (allTitles.length === 0) {
    return NextResponse.json({ error: "No videos found. Try a different niche or add competitor channels." }, { status: 404 });
  }

  await incrementQuota(niche?.trim() ? QUOTA_COSTS.trendingFormats : QUOTA_COSTS.outlierSearch);

  // ── 2. Claude analysis (streaming) ─────────────────────────────────────────
  const titleBlock = allTitles
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 60)
    .map((v, i) => `${i + 1}. "${v.title}" — ${v.channel} (${v.viewCount.toLocaleString()} views)`)
    .join("\n");

  const prompt = `You are a YouTube content strategist. Analyze these ${allTitles.length} high-performing video titles from ${niche ? `the "${niche}" niche` : "competitor channels"} and identify the top trending title formats/frameworks.

TITLES:
${titleBlock}

Identify the 5-7 most dominant title FORMATS (not topics) — the structural patterns and psychological triggers that keep appearing in top-performing videos.

Return a JSON array of objects with this shape:
[
  {
    "format": "Short name for the format (e.g. 'The Personal Experiment')",
    "template": "Reusable template (e.g. 'I Did [X] for [Timeframe] — Here\\'s What [Outcome]')",
    "trigger": "One word psychological trigger (e.g. 'curiosity', 'fomo', 'transformation', 'contrarian', 'challenge', 'insider knowledge')",
    "why": "1-2 sentences on why this format is working right now",
    "examples": ["exact title from the list", "another exact title from the list"],
    "count": 4
  }
]

Rules:
- Focus on FORMAT/STRUCTURE, not topic (don't say "fitness content is trending")
- examples must be real titles from the list above
- count = how many titles in the list match this format
- Sort by count descending
- Return ONLY the JSON array, no other text`;

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (e: any) {
        controller.enqueue(encoder.encode(JSON.stringify({ error: e.message })));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Title-Count": String(allTitles.length),
      "X-Niche-Count": String(nicheTitles.length),
      "X-Competitor-Count": String(competitorTitles.length),
    },
  });
}
