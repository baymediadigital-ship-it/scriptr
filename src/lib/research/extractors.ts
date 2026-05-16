import * as cheerio from "cheerio";

// ─── YouTube transcript ───────────────────────────────────────────────────────

function extractVideoId(input: string): string | null {
  // Handle full URLs and plain IDs
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function extractYouTubeTranscript(input: string): Promise<{ title: string; content: string; url: string }> {
  const videoId = extractVideoId(input);
  if (!videoId) throw new Error("Could not extract YouTube video ID");

  const { YoutubeTranscript } = await import("youtube-transcript");
  const entries = await YoutubeTranscript.fetchTranscript(videoId);
  const content = entries.map((e: any) => e.text).join(" ");

  if (!content.trim()) throw new Error("No transcript available for this video");

  // Fetch title via YouTube oEmbed (no API key needed)
  let title = `YouTube video ${videoId}`;
  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://youtu.be/${videoId}&format=json`
    );
    if (oembedRes.ok) {
      const oembed = await oembedRes.json();
      title = oembed.title ?? title;
    }
  } catch {}

  return { title, content, url: `https://youtu.be/${videoId}` };
}

// ─── Web URL ──────────────────────────────────────────────────────────────────

export async function extractUrl(url: string): Promise<{ title: string; content: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Scriptr/1.0)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // Remove noise
  $("script, style, nav, footer, header, aside, iframe, noscript").remove();

  const title = $("title").text().trim() || $("h1").first().text().trim() || url;

  // Extract main content — prefer article/main, fall back to body
  const mainEl = $("article, main, [role='main']").first();
  const raw = mainEl.length ? mainEl.text() : $("body").text();

  // Normalise whitespace
  const content = raw.replace(/\s+/g, " ").trim().slice(0, 50000);

  if (content.length < 100) throw new Error("Could not extract meaningful content from URL");

  return { title, content };
}

// ─── Plain text ───────────────────────────────────────────────────────────────

export function extractPlainText(text: string, title = "Pasted text"): { title: string; content: string } {
  const content = text.trim().slice(0, 50000);
  if (content.length < 20) throw new Error("Text is too short");
  return { title, content };
}
