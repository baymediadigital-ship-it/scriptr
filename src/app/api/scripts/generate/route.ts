import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { z } from "zod";
import { buildScriptPrompt } from "@/lib/ai/prompts";
import { getUser } from "@/lib/supabase/user";
import { getSubscription, isPro, getLimits } from "@/lib/billing/subscription";
import { getUsage, incrementUsage } from "@/lib/billing/usage";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const TIMEOUT_MS = 60_000;

const ScriptInputSchema = z.object({
  videoTitle: z.string().min(1).max(300),
  format: z.enum(["pas", "educational", "story", "listicle", "documentary", "review"]),
  tone: z.enum(["conversational", "professional", "energetic", "calm", "humorous"]),
  targetLength: z.enum(["short", "medium", "long"]),
  outline: z.string().max(5000).optional(),
  context: z.string().max(5000).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const subscription = await getSubscription(user.id);
  if (!isPro(subscription)) {
    const usage = await getUsage(user.id);
    const limits = getLimits(subscription);
    if (usage.scriptsGenerated >= limits.scriptsGenerated) {
      return new Response(
        JSON.stringify({ error: "Monthly limit reached. Upgrade to Pro for unlimited scripts.", limitReached: true }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = ScriptInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = await createClient();
  const { data: voice } = await supabase
    .from("voice_profiles")
    .select("channel_name,niche,style_description,example_script,avoid_phrases")
    .eq("user_id", user.id)
    .single();

  const prompt = buildScriptPrompt(parsed.data, voice ?? undefined);

  await incrementUsage(user.id, "scripts_generated");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(streamController) {
      try {
        const stream = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
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

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
