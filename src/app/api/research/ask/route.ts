import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_CONTEXT_CHARS = 80000; // ~20k tokens of context

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { question, sourceIds } = await req.json() as {
    question: string;
    sourceIds: string[];
  };

  if (!question?.trim()) {
    return new Response(JSON.stringify({ error: "question is required" }), { status: 400 });
  }

  // Fetch selected sources (or all if none specified)
  let query = supabase
    .from("research_sources")
    .select("title, content, type, source_url")
    .eq("user_id", user.id);

  if (sourceIds?.length) {
    query = query.in("id", sourceIds);
  }

  const { data: sources, error } = await query.order("created_at", { ascending: false }).limit(10);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  if (!sources?.length) return new Response(JSON.stringify({ error: "No research sources found" }), { status: 400 });

  // Build context — trim if too large
  let totalChars = 0;
  const contextParts: string[] = [];

  for (const src of sources) {
    const header = `### ${src.title}${src.source_url ? ` (${src.source_url})` : ""}\n`;
    const remaining = MAX_CONTEXT_CHARS - totalChars - header.length;
    if (remaining <= 0) break;
    const snippet = src.content.slice(0, remaining);
    contextParts.push(header + snippet);
    totalChars += header.length + snippet.length;
  }

  const context = contextParts.join("\n\n---\n\n");

  const prompt = `You are a YouTube research assistant helping a creator write better video scripts.

Below is research material the creator has collected:

${context}

---

Based on the research above, answer the following question or complete the task. Be specific, cite relevant details from the sources, and frame your response to be useful for video script writing.

Question / Task: ${question}`;

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
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
