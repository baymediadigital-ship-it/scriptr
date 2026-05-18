import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { viralTitle, sourceNiche, targetNiche } = await req.json();

  if (!viralTitle?.trim() || !targetNiche?.trim()) {
    return NextResponse.json({ error: "viralTitle and targetNiche are required" }, { status: 400 });
  }

  const prompt = `You are an expert YouTube strategist who specialises in format transfer — taking title/video formulas that perform exceptionally well in one niche and adapting them to a different niche.

VIRAL TITLE: "${viralTitle}"
${sourceNiche ? `SOURCE NICHE: ${sourceNiche}` : ""}
TARGET NICHE: ${targetNiche}

Your task:
1. Deeply analyse the title formula — identify the psychological trigger (curiosity, FOMO, contrarian, insider knowledge, transformation, challenge, etc.), the structural pattern, and what makes it work.
2. Generate 10 adapted title variations for the TARGET NICHE, preserving the exact same psychological trigger and structural pattern but with entirely new niche-specific content.

Return ONLY a valid JSON array. No markdown, no code fences, no explanation outside the JSON.

[
  {
    "title": "the adapted title for target niche",
    "formula": "short name for the formula pattern (e.g. 'The $0 vs Premium', 'The Secret Nobody Talks About')",
    "trigger": "the psychological trigger this uses (1 sentence)",
    "angle": "specific angle/hook suggestion for how to execute this video (1-2 sentences)"
  }
]

Rules:
- All 10 titles must be different angles — no repetition of the same idea
- Titles should feel native to the target niche, not forced
- Keep the energy and punchy language of the original
- Vary the formats: some questions, some statements, some numbers, some contrarian
- Make them genuinely compelling — these should feel like they could hit 1M+ views`;

  try {
    const stream = await client.messages.stream({
      model: "claude-opus-4-5",
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
