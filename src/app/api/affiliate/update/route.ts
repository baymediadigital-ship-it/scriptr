import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/user";
import { createServiceClient } from "@/lib/supabase/service";
import { z } from "zod";

const Schema = z.object({
  code: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, hyphens and underscores"),
  name: z.string().min(1).max(80),
});

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Check code not taken by another affiliate
  const { data: existing } = await supabase
    .from("affiliates")
    .select("id")
    .eq("code", parsed.data.code)
    .neq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "That code is already taken" }, { status: 409 });
  }

  const { error } = await supabase
    .from("affiliates")
    .update({ code: parsed.data.code, name: parsed.data.name })
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, code: parsed.data.code });
}
