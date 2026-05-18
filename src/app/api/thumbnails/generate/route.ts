import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FAL_API_KEY not configured" }, { status: 500 });
  }

  fal.config({ credentials: apiKey });

  try {
    const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
      input: {
        prompt: `${prompt}, dark background, dramatic studio lighting, high contrast, photorealistic, 8k, sharp, no text, no words, no letters, 16:9`,
        num_images: 1,
        image_size: "landscape_16_9",
        output_format: "jpeg",
        safety_tolerance: "5",
      },
    });

    const images = (result.data as any)?.images;
    const imageUrl = Array.isArray(images) ? images[0]?.url : null;

    if (!imageUrl) {
      return NextResponse.json({ error: "No image returned from fal.ai" }, { status: 500 });
    }

    return NextResponse.json({ url: imageUrl });
  } catch (err: any) {
    console.error("fal.ai error:", err);
    return NextResponse.json({ error: err.message ?? "Image generation failed" }, { status: 500 });
  }
}
