import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getVideoById, getVideoComments } from "@/lib/youtube/client";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const TIMEOUT_MS = 60_000;

const BodySchema = z.object({
  videoId: z.string().min(1).max(20),
  videoTitle: z.string().max(300).optional(),
  channelName: z.string().max(100).optional(),
});

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

  const { videoId, videoTitle, channelName } = parsed.data;

  const [video, comments] = await Promise.all([
    videoTitle ? null : getVideoById(videoId).catch(() => null),
    getVideoComments(videoId, 100),
  ]);

  const title = videoTitle ?? video?.title ?? "Unknown video";
  const channel = channelName ?? video?.channelTitle ?? "";

  if (!comments.length) {
    return new Response(JSON.stringify({ error: "No comments found. Comments may be disabled on this video." }), { status: 400 });
  }

  const sorted = [...comments].sort((a, b) => b.likes - a.likes).slice(0, 80);
  const commentBlock = sorted
    .map((c, i) => `[${i + 1}] (${c.likes} likes) ${c.text.replace(/<[^>]+>/g, "")}`)
    .join("\n");

  const prompt = `You are analyzing YouTube comments for a video to help a creator understand their audience and find content opportunities.

Video: "${title}"${channel ? `\nChannel: ${channel}` : ""}
Total comments fetched: ${comments.length}

TOP COMMENTS (sorted by likes):
${commentBlock}

Analyze these comments and return a structured breakdown in exactly this format:

### WHAT THEY LOVED
[3-5 bullet points of what specifically resonated — be concrete, quote phrases where relevant]

### FOLLOW-UP VIDEOS THEY'RE ASKING FOR
[4-6 specific video ideas the audience is explicitly or implicitly requesting, with the exact angle]

### QUESTIONS & CONFUSION
[3-5 things viewers were confused about or asked questions about — content gaps to address in future videos]

### AUDIENCE INSIGHTS
[3-4 observations about who this audience is, what they care about, their level of knowledge — useful for targeting future content]

### STANDOUT QUOTES
[3 verbatim comment quotes (cleaned up) that best capture the audience's emotional reaction]

IMPORTANT FORMATTING RULES:
- No markdown. No bold, no asterisks, no backticks, no -- separators.
- Plain bullet points starting with a dash (-) only.
- Keep each bullet to 1-2 sentences. Be specific and direct.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(streamController) {
      try {
        const stream = await anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
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
