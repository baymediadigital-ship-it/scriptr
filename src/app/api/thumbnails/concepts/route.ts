import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { videoTitle, description, tone, style } = await req.json();

  if (!videoTitle?.trim()) {
    return new Response(JSON.stringify({ error: "videoTitle is required" }), { status: 400 });
  }

  const prompt = `You are a world-class YouTube thumbnail strategist. You've studied over 100,000 viral thumbnails and know exactly what drives clicks in every niche.

VIDEO TITLE: "${videoTitle}"
${description ? `CONTEXT: ${description}` : ""}
${tone ? `TONE: ${tone}` : ""}
${style ? `PREFERRED STYLE: ${style}` : ""}

STEP 1 — ANALYZE THE TITLE:
- What niche is this? (finance, fitness, tech, gaming, food, travel, etc.)
- What emotion should the thumbnail trigger? (shock, curiosity, FOMO, inspiration, fear of missing out, etc.)
- What's the core promise or payoff of the video?
- Who is the target viewer?

STEP 2 — GENERATE 4 THUMBNAIL CONCEPTS using 4 COMPLETELY DIFFERENT visual strategies:

**Concept 1 — Face Reaction:** A person (neutral ethnicity, relatable) with an exaggerated but authentic reaction (shock, excitement, disbelief). Clean solid background. Space on left for text. Studio lighting.

**Concept 2 — Visual Metaphor / Scene:** No face. A powerful scene, object, or visual metaphor that instantly communicates the video's core idea. Cinematic lighting. High contrast.

**Concept 3 — Before/After or Contrast:** Split composition showing two contrasting states, transformations, or comparisons. Clear visual divide. Bold color contrast between the two sides.

**Concept 4 — Niche-specific formula:** Use the proven thumbnail formula that dominates THIS specific niche. (e.g. for finance: money stacks + graphs; for fitness: transformation body shot; for tech: glowing screens + hands; for food: extreme close-up of food)

For each concept, write an image generation prompt that is:
- Extremely specific about composition, subject placement, expressions, lighting, colors
- Photorealistic style (not illustrated, not cartoon)
- Always 16:9 landscape
- Always leaves clear space for text overlay (usually left or top-left third)
- Never includes actual text/words in the image

Format exactly like this (no deviations):

### CONCEPT 1: [Name]
**Image prompt:** [hyper-detailed fal.ai image generation prompt — minimum 40 words]
**Text overlay:** [3-5 words max, all caps, punchy]
**Colors:** [#hex1, #hex2, #hex3]
**Why it works:** [one specific sentence about the psychological trigger]

### CONCEPT 2: [Name]
**Image prompt:** [hyper-detailed prompt]
**Text overlay:** [3-5 words]
**Colors:** [#hex1, #hex2]
**Why it works:** [one sentence]

### CONCEPT 3: [Name]
**Image prompt:** [hyper-detailed prompt]
**Text overlay:** [3-5 words]
**Colors:** [#hex1, #hex2]
**Why it works:** [one sentence]

### CONCEPT 4: [Name]
**Image prompt:** [hyper-detailed prompt]
**Text overlay:** [3-5 words]
**Colors:** [#hex1, #hex2]
**Why it works:** [one sentence]`;

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
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
