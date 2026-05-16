import type { YouTubeVideo, OutlierVideo, ChannelAnalysis, YouTubeChannel } from "@/types/youtube";

// ─── Stats helpers ────────────────────────────────────────────────────────────

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stdDev(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// ─── Outlier scoring ──────────────────────────────────────────────────────────

/**
 * Outlier score = video views / channel median views
 *
 * We use median (not mean) as the baseline so a few mega-viral videos
 * don't skew the "normal" bar upward.
 *
 * Performance labels:
 *  - mega     : score >= 10x  (exceptional outlier)
 *  - high     : score >= 3x   (strong outlier)
 *  - moderate : score >= 1.5x (mild outlier)
 *  - normal   : below 1.5x
 *
 * Recency factor: exponential decay with a 120-day half-life.
 * A video published today keeps its full outlier score; one published
 * 120 days ago is weighted at 0.5x; 240 days ago at 0.25x, etc.
 * This surfaces recent breakouts above older (possibly evergreen) hits.
 */
function labelPerformance(score: number): OutlierVideo["performanceLabel"] {
  if (score >= 10) return "mega";
  if (score >= 3) return "high";
  if (score >= 1.5) return "moderate";
  return "normal";
}

function recencyFactor(publishedAt: string): number {
  const daysOld = (Date.now() - new Date(publishedAt).getTime()) / 86_400_000;
  // Half-life of 120 days — score halves every 4 months
  return Math.pow(0.5, daysOld / 120);
}

export function detectOutliers(
  videos: YouTubeVideo[],
  options: {
    minOutlierScore?: number; // default 1.5 — only return videos above this
    minViews?: number;        // ignore videos below this view count
  } = {}
): {
  outliers: OutlierVideo[];
  avgViews: number;
  medianViews: number;
} {
  const { minOutlierScore = 1.5, minViews = 0 } = options;

  // Filter out shorts/premieres with very low views if minViews set
  const eligible = videos.filter((v) => v.viewCount >= minViews);
  if (!eligible.length) return { outliers: [], avgViews: 0, medianViews: 0 };

  const viewCounts = eligible.map((v) => v.viewCount);
  const avgViews = mean(viewCounts);
  const medianViews = median(viewCounts);

  // Use median as baseline — more robust than mean
  const baseline = medianViews || avgViews || 1;

  const scored: OutlierVideo[] = eligible.map((video) => {
    const score = video.viewCount / baseline;
    const daysOld = Math.round((Date.now() - new Date(video.publishedAt).getTime()) / 86_400_000);
    const rScore = parseFloat((score * recencyFactor(video.publishedAt)).toFixed(2));
    return {
      ...video,
      outlierScore: parseFloat(score.toFixed(2)),
      recencyScore: rScore,
      channelAvgViews: Math.round(avgViews),
      performanceLabel: labelPerformance(score),
      viewsAboveAverage: video.viewCount - Math.round(avgViews),
      daysOld,
    };
  });

  const outliers = scored
    .filter((v) => v.outlierScore >= minOutlierScore)
    .sort((a, b) => b.recencyScore - a.recencyScore);

  return { outliers, avgViews, medianViews };
}

// ─── Full channel analysis ────────────────────────────────────────────────────

export function analyzeChannel(
  channel: YouTubeChannel,
  videos: YouTubeVideo[],
  options?: { minOutlierScore?: number; minViews?: number }
): ChannelAnalysis {
  const { outliers, avgViews, medianViews } = detectOutliers(videos, options);

  return {
    channel,
    videos,
    avgViews,
    medianViews,
    outliers,
    analyzedAt: new Date().toISOString(),
  };
}

// ─── Niche-level outlier detection ───────────────────────────────────────────

/**
 * Given videos from multiple channels in the same niche,
 * find which videos are outliers relative to the entire niche average.
 * Useful for "what's blowing up in this niche right now".
 */
export function detectNicheOutliers(
  allVideos: YouTubeVideo[],
  options: { minOutlierScore?: number; minViews?: number } = {}
): OutlierVideo[] {
  const { outliers } = detectOutliers(allVideos, options);
  return outliers;
}
