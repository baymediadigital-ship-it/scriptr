export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  customUrl?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  channelId: string;
  channelTitle: string;
  tags?: string[];
}

export interface OutlierVideo extends YouTubeVideo {
  outlierScore: number;       // viewCount / channelMedianViews
  recencyScore: number;       // outlierScore weighted by how recent the video is
  channelAvgViews: number;
  performanceLabel: "mega" | "high" | "moderate" | "normal";
  viewsAboveAverage: number;  // absolute difference
  daysOld: number;
}

export interface ChannelAnalysis {
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
  avgViews: number;
  medianViews: number;
  outliers: OutlierVideo[];
  analyzedAt: string;
}

export interface SearchChannelResult {
  id: string;
  title: string;
  thumbnail: string;
  subscriberCount: number;
  description: string;
}
