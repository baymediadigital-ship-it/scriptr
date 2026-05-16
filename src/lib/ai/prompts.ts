import type { ScriptInput } from "@/types/script";

export type VoiceProfile = {
  channel_name?: string | null;
  niche?: string | null;
  style_description?: string | null;
  example_script?: string | null;
  avoid_phrases?: string | null;
};

const FORMAT_DESCRIPTIONS: Record<string, string> = {
  pas: "Problem-Agitation-Solution: Start by identifying a relatable problem, agitate it by amplifying the pain, then present your video as the solution.",
  educational: "Educational / Tutorial: Teach the viewer something step-by-step. Clear intro, structured sections with actionable takeaways.",
  story: "Story-based Narrative: Open with a compelling personal or third-party story, build tension, deliver the lesson through the narrative arc.",
  listicle: "Listicle: 'Top N' format. Tease the list in the hook, go through each point with depth, save the best for last.",
  documentary: "Documentary: Journalistic tone, present evidence and multiple perspectives, build toward a clear conclusion.",
  review: "Review: Establish credibility, go through key aspects systematically, pros/cons, clear verdict at the end.",
};

const LENGTH_WORDS: Record<string, string> = {
  short: "approximately 700–900 words (5-minute video)",
  medium: "approximately 1,400–1,800 words (10-minute video)",
  long: "approximately 2,800–3,500 words (20-minute video)",
};

export function buildScriptPrompt(input: ScriptInput, voice?: VoiceProfile): string {
  const {
    videoTitle,
    videoDescription,
    channelName,
    viewCount,
    outlierScore,
    tags,
    format,
    tone,
    targetLength,
    customInstructions,
  } = input;

  const contextLines = [
    `Reference video title: "${videoTitle}"`,
    channelName ? `Channel: ${channelName}` : null,
    viewCount ? `Views: ${viewCount.toLocaleString()}` : null,
    outlierScore ? `Outlier score: ${outlierScore}x above channel average` : null,
    videoDescription ? `Video description: ${videoDescription.slice(0, 400)}` : null,
    tags?.length ? `Tags: ${tags.slice(0, 10).join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const voiceSection = voice?.style_description
    ? `\n## Creator Voice Profile\n${voice.channel_name ? `Channel: ${voice.channel_name}\n` : ""}${voice.niche ? `Niche: ${voice.niche}\n` : ""}Writing style: ${voice.style_description}${voice.avoid_phrases ? `\nPhrases/styles to AVOID: ${voice.avoid_phrases}` : ""}${voice.example_script ? `\n\nExample of their writing style (match this voice):\n---\n${voice.example_script.slice(0, 800)}\n---` : ""}\n`
    : "";

  return `You are an expert YouTube scriptwriter. Your job is to write a high-retention video script inspired by a proven outlier video.

## Reference Video Context
${contextLines}
${voiceSection}
## Script Requirements
- Format: ${FORMAT_DESCRIPTIONS[format]}
- Tone: ${tone}
- Target length: ${LENGTH_WORDS[targetLength]}
${customInstructions ? `- Additional instructions: ${customInstructions}` : ""}

## Important Rules
- Do NOT copy the reference video. Use it only as inspiration for the topic angle and format.
- Write in a natural, spoken voice — this will be read aloud on camera.
- Open with a hook that grabs attention in the first 15 seconds.
- Use pattern interrupts every 60–90 seconds (questions, surprising facts, scene changes).
- End with a strong call to action (subscribe, comment, watch next video).
- No filler phrases like "In this video, I will..." or "Don't forget to like and subscribe" at the start.

## Output Format
Return the script in this exact structure:

### TITLE
[Suggested video title — punchy, SEO-friendly]

### HOOK (0:00–0:15)
[Opening lines — must be gripping]

### BODY
[Main script content with natural section breaks. Label each section with a timestamp estimate e.g. (1:30)]

### CALL TO ACTION
[Closing lines]

---
Now write the full script:`;
}
