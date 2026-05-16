import { NextRequest, NextResponse } from "next/server";
import { getVideoComments } from "@/lib/youtube/client";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("videoId");
  if (!id) return NextResponse.json({ error: "Missing ?videoId=" }, { status: 400 });

  try {
    const comments = await getVideoComments(id, 100);
    return NextResponse.json(comments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
