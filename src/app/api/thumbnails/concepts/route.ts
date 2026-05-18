import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { videoTitle, description, tone, style } = await req.json();

  if (!videoTitle?.trim()) {
    return new Response(JSON.stringify({ error: "videoTitle is required" }), { status: 400 });
  }

  const prompt = `You are a world-class YouTube thumbnail art director. You've studied 100,000+ viral thumbnails and know exactly what drives clicks in every niche.

VIDEO TITLE: "${videoTitle}"
${description ? `CONTEXT: ${description}` : ""}
${tone ? `TONE: ${tone}` : ""}
${style ? `PREFERRED STYLE: ${style}` : ""}

VISUAL STYLE RULES — every concept must follow these:
- Background: near-black (#080808 to #111111) or very dark charcoal. Never white, never bright.
- Lighting: dramatic studio lighting — single strong key light, deep shadows, rim lighting on edges
- Text space: always leave the top-left or left third completely empty for text overlay
- No text, letters, numbers, or words anywhere in the image
- Photorealistic, ultra-sharp, cinematic quality
- High contrast between subject and background
- Colour accent: one bold accent colour (red, orange, yellow, cyan, or gold) against the dark background

STEP 1 — ANALYSE THE TITLE:
- Niche: identify the specific content category
- Emotion: what feeling should stop the scroll? (shock, awe, curiosity, FOMO, dread)
- Hero visual: what ONE object, person, or scene best represents the core idea?

STEP 2 — GENERATE 4 CONCEPTS using 4 COMPLETELY DIFFERENT visual strategies:

**Concept 1 — Dramatic Face:** Close-up of a person (relatable, neutral ethnicity) with a powerful emotional expression (shock, disbelief, intense focus). Face occupies right 60% of frame. Dark background. Strong rim light on face. Top-left empty for text.

**Concept 2 — Hero Object / Scene:** No face. The single most powerful physical object or scene that represents the video topic. Dark studio background. Dramatic underlighting or spotlight. The object should feel larger-than-life. Think: money stacks, glowing laptops, food extreme close-up, car on dark floor, supplement bottles.

**Concept 3 — Cinematic Scene:** Wide or medium shot. Atmospheric, moody, cinematic. Dark environment with one strong light source (fire, neon, screen glow, spotlight). Tells a story in one frame. Subject in right two-thirds, text space top-left.

**Concept 4 — Bold Contrast / Split:** Two-panel split or stark before/after. Left panel dark with one colour accent, right panel dark with contrasting accent. Clean dividing line. Symmetrical composition. Both sides dark-backgrounded with bold coloured subjects.

For each concept write a fal.ai image generation prompt that is:
- Minimum 50 words
- Extremely specific: subject, pose, expression, exact lighting setup, exact background colour, camera angle, depth of field
- Ends with: "dark background, dramatic studio lighting, photorealistic, 8k, no text"

Format exactly like this:

### CONCEPT 1: [Name]
**Image prompt:** [50+ word prompt ending with "dark background, dramatic studio lighting, photorealistic, 8k, no text"]
**Text overlay:** [3-5 words, all caps]
**Colors:** [#hex1, #hex2]
**Why it works:** [one sentence on the psychological trigger]

### CONCEPT 2: [Name]
**Image prompt:** [50+ word prompt]
**Text overlay:** [3-5 words, all caps]
**Colors:** [#hex1, #hex2]
**Why it works:** [one sentence]

### CONCEPT 3: [Name]
**Image prompt:** [50+ word prompt]
**Text overlay:** [3-5 words, all caps]
**Colors:** [#hex1, #hex2]
**Why it works:** [one sentence]

### CONCEPT 4: [Name]
**Image prompt:** [50+ word prompt]
**Text overlay:** [3-5 words, all caps]
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
