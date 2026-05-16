import { NextRequest, NextResponse } from "next/server";
import { getChannelById, getChannelByHandle, searchChannels } from "@/lib/youtube/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const handle = searchParams.get("handle");
  const query = searchParams.get("q");

  try {
    if (id) {
      const channel = await getChannelById(id);
      return NextResponse.json(channel);
    }

    if (handle) {
      const channel = await getChannelByHandle(handle);
      return NextResponse.json(channel);
    }

    if (query) {
      const results = await searchChannels(query);
      return NextResponse.json(results);
    }

    return NextResponse.json(
      { error: "Provide ?id=, ?handle=, or ?q= parameter" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
