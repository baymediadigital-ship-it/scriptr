import { NextResponse } from "next/server";

export const revalidate = 21600;

const HANDLES = [
  "AlexHormozi",
  "imangadzhi",
  "mkbhd",
  "MrBeast",
  "GrahamStephan",
  "JeffNippard",
  "NonstopSports",
  "athleanx",
];

async function resolveHandleToId(handle: string): Promise<string | null> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${process.env.YOUTUBE_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const data = await res.json();
    return data.items?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

function parseRSS(xml: string, fallbackChannel: string) {
  const entries: { id: string; title: string; channel: string; thumbnail: string; fallback: string }[] = [];
  const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  for (const entry of entryMatches) {
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim();
    const title = entry.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() ?? "";
    const channel = entry.match(/<name>([^<]+)<\/name>/)?.[1]?.trim() ?? fallbackChannel;
    if (!videoId) continue;
    entries.push({
      id: videoId,
      title,
      channel,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      fallback: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    });
  }
  return entries;
}

export async function GET() {
  try {
    // Resolve all handles to channel IDs in parallel
    const ids = await Promise.all(HANDLES.map(resolveHandleToId));

    // Fetch RSS for each resolved channel
    const results = await Promise.allSettled(
      ids.map((id, i) => {
        if (!id) return Promise.resolve([]);
        return fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`, {
          next: { revalidate: 21600 },
        })
          .then((r) => r.text())
          .then((xml) => parseRSS(xml, HANDLES[i]).slice(0, 4));
      })
    );

    const thumbnails = results
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .filter((v) => v.id && v.thumbnail);

    return NextResponse.json(thumbnails, {
      headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
