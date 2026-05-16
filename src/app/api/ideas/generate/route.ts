import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { getUser } from "@/lib/supabase/user";
import { getSubscription, isPro, getLimits } from "@/lib/billing/subscription";
import { getUsage, incrementUsage } from "@/lib/billing/usage";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const subscription = await getSubscription(user.id);
  if (!isPro(subscription)) {
    const usage = await getUsage(user.id);
    const limits = getLimits(subscription);
    if (usage.outlierSearches >= limits.outlierSearches) {
      return new Response(
        JSON.stringify({ error: "Monthly limit reached. Upgrade to Pro.", limitReached: true }),
        { status: 403 }
      );
    }
  }

  const { niche, tone, count = 50 } = await req.json();
  if (!niche) return new Response(JSON.stringify({ error: "Niche is required" }), { status: 400 });

  // Load voice profile if available
  const supabase = await createClient();
  const { data: voice } = await supabase
    .from("voice_profiles")
    .select("channel_name, style_description, avoid_phrases")
    .eq("user_id", user.id)
    .single();

  const voiceContext = voice?.style_description
    ? `\n\nCreator voice: ${voice.style_description}${voice.avoid_phrases ? `\nAvoid: ${voice.avoid_phrases}` : ""}`
    : "";

  const prompt = `You are a YouTube strategist. Generate exactly ${count} proven video ideas for the "${niche}" niche.

Each idea must be:
- Specific, clickable, and based on what actually gets views in this niche
- Varied across formats: tutorials, stories, lists, hot takes, case studies, reactions
- Optimized for search AND browse (mix of SEO titles and curiosity-gap titles)
${tone ? `- Tone: ${tone}` : ""}${voiceContext}

Return ONLY a JSON array in this exact format, no other text:
[
  {
    "title": "The exact video title",
    "hook": "One sentence opening hook for the script",
    "angle": "What makes this unique / the key insight",
    "format": "tutorial|story|listicle|case_study|hot_take|documentary",
    "estimatedViews": "high|medium|evergreen"
  }
]`;

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  await incrementUsage(user.id, "outlier_searches");

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
