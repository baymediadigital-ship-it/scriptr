import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { videoTitle, description, tone, style } = await req.json();

  if (!videoTitle?.trim()) {
    return new Response(JSON.stringify({ error: "videoTitle is required" }), { status: 400 });
  }

  const prompt = `You are a YouTube thumbnail expert. Generate 4 distinct thumbnail concepts for this video.

Video title: "${videoTitle}"
${description ? `Description: ${description}` : ""}
${tone ? `Tone: ${tone}` : ""}
${style ? `Visual style: ${style}` : ""}

For each concept provide:
1. A short concept name
2. A detailed image generation prompt (for FLUX AI image generator) — be specific about composition, lighting, colors, subjects, expressions
3. Recommended text overlay (max 5 words, bold, high contrast)
4. Color scheme (2-3 hex colors)
5. Why this concept works for YouTube CTR

Format each concept exactly like this:

### CONCEPT 1: [Name]
**Image prompt:** [detailed prompt for image generation]
**Text overlay:** [short punchy text]
**Colors:** [#hex1, #hex2]
**Why it works:** [one sentence]

### CONCEPT 2: [Name]
...and so on for all 4 concepts.`;

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
