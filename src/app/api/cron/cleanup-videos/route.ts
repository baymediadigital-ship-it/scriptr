import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Keeps only the 50 most recent videos per channel, deletes the rest.
// Run weekly — add to vercel.json: { "path": "/api/cron/cleanup-videos", "schedule": "0 3 * * 0" }
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Delete rows older than the 50 most recent per channel
  const { error } = await supabase.rpc("cleanup_old_channel_videos");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
