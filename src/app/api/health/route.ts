import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  // Supabase connectivity check
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("tracked_channels").select("id").limit(1);
    checks.database = error ? "error" : "ok";
  } catch {
    checks.database = "error";
  }

  // Env var checks (don't expose values, just confirm they exist)
  checks.youtube_api = process.env.YOUTUBE_API_KEY ? "ok" : "error";
  checks.anthropic = process.env.ANTHROPIC_API_KEY ? "ok" : "error";
  checks.stripe = process.env.STRIPE_SECRET_KEY ? "ok" : "error";

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    { status: allOk ? "ok" : "degraded", checks, ts: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  );
}
