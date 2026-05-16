import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getVideoComments } from "@/lib/youtube/client";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const TIMEOUT_MS = 60_000;

const BodySchema = z.object({
  videoId: z.string().min(1).max(20),
  title: z.string().min(1).max(300),
  channelTitle: z.string().max(100).optional(),
  viewCount: z.number().int().min(0),
  outlierScore: z.number().min(0),
  channelAvgViews: z.number().min(0).optional(),
  publishedAt: z.string().optional(),
});

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }), { status: 400 });
  }

  const { videoId, title, channelTitle, viewCount, outlierScore, channelAvgViews, publishedAt } = parsed.data;

  const comments = await getVideoComments(videoId, 50);
  const topComments = [...comments]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 20)
    .map((c) => `• ${c.text.replace(/<[^>]+>/g, "").slice(0, 200)}`)
    .join("\n");

  const prompt = `You are a YouTube growth expert. Analyze why this specific video dramatically outperformed the channel average and provide a detailed, actionable breakdown.

VIDEO DATA:
- Title: "${title}"
- Channel: ${channelTitle ?? "Unknown"}
- Views: ${formatNumber(viewCount)} (${outlierScore}x the channel average of ${formatNumber(Math.round(channelAvgViews ?? 0))})
- Published: ${publishedAt ? new Date(publishedAt).toLocaleDateString() : "Unknown"}

TOP COMMENTS:
${topComments || "Comments not available"}

Analyze exactly WHY this video outperformed and return in this format.

IMPORTANT FORMATTING RULES:
- No markdown. No bold, no asterisks, no backticks, no -- separators.
- Each section has 3-5 plain bullet points starting with a dash (-).
- Keep each bullet to 1-2 sentences max. Be direct and specific.

### TITLE FORMULA
- [one insight about the title pattern]
- [replicable formula the reader can use]

### TOPIC ANGLE
- [why this specific angle worked]

### AUDIENCE PSYCHOLOGY
- [core psychological trigger]

### WHAT THE COMMENTS REVEAL
- [insight from comment patterns]

### HOW TO REPLICATE THIS
- [concrete action 1]
- [concrete action 2]
- [concrete action 3]

### RISK FACTORS
- [timing or luck factor]

Be brutally specific. Every insight must be tied directly to this video's data.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(streamController) {
      try {
        const stream = await anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const chunk of stream) {
          if (controller.signal.aborted) break;
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            streamController.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") streamController.error(err);
      } finally {
        clearTimeout(timeout);
        streamController.close();
      }
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
