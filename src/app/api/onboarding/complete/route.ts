import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/user";

export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  await supabase.from("profiles").upsert(
    { user_id: user.id, onboarding_completed: true },
    { onConflict: "user_id" }
  );

  return NextResponse.json({ ok: true });
}
