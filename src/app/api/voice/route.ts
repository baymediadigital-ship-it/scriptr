import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/user";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data } = await supabase
    .from("voice_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json(data ?? {});
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = await createClient();

  await supabase.from("voice_profiles").upsert(
    {
      user_id: user.id,
      channel_name: body.channel_name ?? null,
      niche: body.niche ?? null,
      style_description: body.style_description ?? null,
      example_script: body.example_script ?? null,
      avoid_phrases: body.avoid_phrases ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return NextResponse.json({ success: true });
}
