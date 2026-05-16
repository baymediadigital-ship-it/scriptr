export type ScriptFormat =
  | "pas"          // Problem-Agitation-Solution
  | "educational"  // Tutorial / How-to
  | "story"        // Narrative / Story-based
  | "listicle"     // Top N list
  | "documentary"  // Documentary style
  | "review";      // Product / topic review

export type ScriptTone =
  | "conversational"
  | "professional"
  | "energetic"
  | "calm"
  | "humorous";

export interface ScriptInput {
  videoTitle: string;
  videoDescription?: string;
  channelName?: string;
  viewCount?: number;
  outlierScore?: number;
  tags?: string[];
  format: ScriptFormat;
  tone: ScriptTone;
  targetLength: "short" | "medium" | "long"; // ~5min, ~10min, ~20min
  customInstructions?: string;
}

export interface GeneratedScript {
  title: string;
  hook: string;
  body: string;
  callToAction: string;
  fullScript: string;
  estimatedDuration: string;
  format: ScriptFormat;
  tone: ScriptTone;
  createdAt: string;
}
