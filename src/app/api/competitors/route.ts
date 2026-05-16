import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChannelByHandle, getChannelById } from "@/lib/youtube/client";

// GET /api/competitors — list tracked channels for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("tracked_channels")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/competitors — add a channel to track
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { handle, channelId } = await req.json();
  if (!handle && !channelId) {
    return NextResponse.json({ error: "Provide handle or channelId" }, { status: 400 });
  }

  try {
    const channel = channelId
      ? await getChannelById(channelId)
      : await getChannelByHandle(handle);

    const { data, error } = await supabase
      .from("tracked_channels")
      .upsert({
        user_id: user.id,
        channel_id: channel.id,
        channel_title: channel.title,
        channel_thumbnail: channel.thumbnail,
        subscriber_count: channel.subscriberCount,
      }, { onConflict: "user_id,channel_id" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/competitors?channelId=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channelId = req.nextUrl.searchParams.get("channelId");
  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 });

  const { error } = await supabase
    .from("tracked_channels")
    .delete()
    .eq("user_id", user.id)
    .eq("channel_id", channelId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
