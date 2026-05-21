import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { frameworksAsPromptBlock } from "@/lib/youtube/title-frameworks";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { viralTitle, sourceNiche, targetNiche } = await req.json();

  if (!viralTitle?.trim() || !targetNiche?.trim()) {
    return NextResponse.json({ error: "viralTitle and targetNiche are required" }, { status: 400 });
  }

  const prompt = `You are an expert YouTube strategist who specialises in format transfer — taking title/video formulas that perform exceptionally well in one niche and adapting them to a different niche.

${frameworksAsPromptBlock()}

---

VIRAL TITLE TO ANALYSE: "${viralTitle}"
${sourceNiche ? `SOURCE NICHE: ${sourceNiche}` : ""}
TARGET NICHE: ${targetNiche}

Your task:
1. Identify which framework category the viral title belongs to (positive, negative, educational, curiosity, or storytelling) and which specific template it most closely matches from the library above.
2. Deeply analyse the psychological trigger (curiosity gap, FOMO, contrarian, insider knowledge, transformation, decline, challenge, etc.) and the structural pattern.
3. Generate 10 adapted title variations for the TARGET NICHE:
   - Start with 3–4 titles that apply the EXACT same framework template to the target niche
   - Then add 4–5 titles that use DIFFERENT framework templates from the same psychological category
   - Finally add 1–2 wildcard titles from a completely different category for contrast

Return ONLY a valid JSON array. No markdown, no code fences, no explanation outside the JSON.

[
  {
    "title": "the adapted title for target niche",
    "formula": "name of the framework template used (from the library above)",
    "trigger": "the psychological trigger this uses (1 sentence)",
    "angle": "specific angle/hook suggestion for how to execute this video (1-2 sentences)"
  }
]

Rules:
- All 10 titles must be different angles — no repetition of the same idea
- Titles should feel native to the target niche, not forced
- Replace every X/Y/Z with concrete niche-specific topics
- Keep the energy and punchy language of the original
- Make them genuinely compelling — these should feel like they could hit 1M+ views`;

  try {
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
