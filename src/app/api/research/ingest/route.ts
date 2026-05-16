import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeTranscript, extractUrl, extractPlainText } from "@/lib/research/extractors";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, input } = body as { type: "youtube" | "url" | "text"; input: string };

  if (!type || !input?.trim()) {
    return NextResponse.json({ error: "type and input are required" }, { status: 400 });
  }

  try {
    let title: string;
    let content: string;
    let source_url: string | null = null;

    if (type === "youtube") {
      const result = await extractYouTubeTranscript(input);
      title = result.title;
      content = result.content;
      source_url = result.url;
    } else if (type === "url") {
      const result = await extractUrl(input);
      title = result.title;
      content = result.content;
      source_url = input;
    } else {
      const result = extractPlainText(input, body.title);
      title = result.title;
      content = result.content;
    }

    const { data, error } = await supabase
      .from("research_sources")
      .insert({ user_id: user.id, type, title, source_url, content })
      .select("id, type, title, source_url, char_count, created_at")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
