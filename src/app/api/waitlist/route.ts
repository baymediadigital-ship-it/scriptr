import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const { email, source } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.toLowerCase().trim(), source: source ?? "waitlist" });

  if (error) {
    // Unique violation = already on list — treat as success
    if (error.code === "23505") {
      return NextResponse.json({ success: true, alreadyJoined: true });
    }
    console.error("Waitlist insert error:", error);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
