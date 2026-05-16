import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY });

async function runWithRetry(input: object, maxRetries = 4): Promise<unknown> {
  let delay = 10_000; // start at 10s (Replicate free tier resets in ~9s)
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await replicate.run("black-forest-labs/flux-schnell", { input });
    } catch (err: any) {
      const is429 = err?.response?.status === 429 || err?.message?.includes("429") || err?.message?.includes("throttled");
      if (is429 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * 1.5, 30_000);
        continue;
      }
      throw err;
    }
  }
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  try {
    const output = await runWithRetry({
      prompt: `YouTube thumbnail, ${prompt}, professional photography, high contrast, vibrant colors, 16:9 aspect ratio`,
      num_outputs: 1,
      aspect_ratio: "16:9",
      output_format: "webp",
      output_quality: 90,
    });

    const imageUrl = Array.isArray(output) ? output[0] : output;
    return NextResponse.json({ url: String(imageUrl) });
  } catch (err: any) {
    const is429 = err?.response?.status === 429 || err?.message?.includes("429") || err?.message?.includes("throttled");
    if (is429) {
      return NextResponse.json(
        { error: "Replicate rate limit hit. Add a payment method at replicate.com to remove limits, or wait a minute and try again." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
