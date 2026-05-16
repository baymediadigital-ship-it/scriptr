import type {
  YouTubeChannel,
  YouTubeVideo,
  SearchChannelResult,
} from "@/types/youtube";

const BASE_URL = "https://www.googleapis.com/youtube/v3";

function apiKey() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");
  return key;
}

async function request<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("key", apiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ?? `YouTube API error: ${res.status}`
    );
  }
  return res.json() as Promise<T>;
}

// ─── Channel ────────────────────────────────────────────────────────────────

export async function getChannelById(channelId: string): Promise<YouTubeChannel> {
  const data = await request<any>("channels", {
    part: "snippet,statistics",
    id: channelId,
  });

  const item = data.items?.[0];
  if (!item) throw new Error(`Channel not found: ${channelId}`);

  return mapChannel(item);
}

export async function getChannelByHandle(handle: string): Promise<YouTubeChannel> {
  // Remove @ if present
  const cleanHandle = handle.replace(/^@/, "");

  const data = await request<any>("channels", {
    part: "snippet,statistics",
    forHandle: cleanHandle,
  });

  const item = data.items?.[0];
  if (!item) throw new Error(`Channel not found: @${cleanHandle}`);

  return mapChannel(item);
}

export async function searchChannels(query: string): Promise<SearchChannelResult[]> {
  const data = await request<any>("search", {
    part: "snippet",
    type: "channel",
    q: query,
    maxResults: "10",
  });

  const ids: string[] = (data.items ?? []).map((i: any) => i.snippet.channelId);
  if (!ids.length) return [];

  const details = await request<any>("channels", {
    part: "snippet,statistics",
    id: ids.join(","),
  });

  return (details.items ?? []).map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.default?.url ?? "",
    subscriberCount: parseInt(item.statistics?.subscriberCount ?? "0", 10),
    description: item.snippet.description ?? "",
  }));
}

// ─── Videos ─────────────────────────────────────────────────────────────────

export async function getChannelVideos(
  channelId: string,
  maxResults = 50
): Promise<YouTubeVideo[]> {
  // Get upload playlist ID
  const channelData = await request<any>("channels", {
    part: "contentDetails",
    id: channelId,
  });

  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) throw new Error("Could not find uploads playlist");

  // Fetch all video IDs from playlist (paginated, up to maxResults)
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  while (videoIds.length < maxResults) {
    const remaining = maxResults - videoIds.length;
    const fetchCount = Math.min(remaining, 50);

    const params: Record<string, string> = {
      part: "contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: String(fetchCount),
    };
    if (pageToken) params.pageToken = pageToken;

    const playlistData = await request<any>("playlistItems", params);
    const items = playlistData.items ?? [];

    for (const item of items) {
      videoIds.push(item.contentDetails.videoId);
    }

    pageToken = playlistData.nextPageToken;
    if (!pageToken || !items.length) break;
  }

  if (!videoIds.length) return [];

  // Fetch video stats in batches of 50
  const videos: YouTubeVideo[] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const videoData = await request<any>("videos", {
      part: "snippet,statistics,contentDetails",
      id: batch.join(","),
    });

    for (const item of videoData.items ?? []) {
      videos.push(mapVideo(item));
    }
  }

  return videos;
}

export interface YouTubeComment {
  id: string;
  text: string;
  likes: number;
  author: string;
  replyCount: number;
  publishedAt: string;
}

export async function getVideoComments(
  videoId: string,
  maxResults = 100
): Promise<YouTubeComment[]> {
  try {
    const data = await request<any>("commentThreads", {
      part: "snippet",
      videoId,
      maxResults: String(maxResults),
      order: "relevance",
    });
    return (data.items ?? []).map((item: any) => {
      const s = item.snippet.topLevelComment.snippet;
      return {
        id: item.id,
        text: s.textDisplay,
        likes: s.likeCount ?? 0,
        author: s.authorDisplayName,
        replyCount: item.snippet.totalReplyCount ?? 0,
        publishedAt: s.publishedAt,
      };
    });
  } catch {
    // Comments disabled on some videos
    return [];
  }
}

export async function getPopularThumbnails(maxResults = 24): Promise<{ id: string; title: string; channel: string; thumbnail: string }[]> {
  // publishedAfter = 90 days ago
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const data = await request<any>("search", {
    part: "snippet",
    type: "video",
    order: "viewCount",
    publishedAfter: since,
    maxResults: String(maxResults),
    videoDuration: "medium",
    videoEmbeddable: "true",
  });

  return (data.items ?? [])
    .map((item: any) => ({
      id: item.id?.videoId ?? "",
      title: item.snippet?.title ?? "",
      channel: item.snippet?.channelTitle ?? "",
      thumbnail:
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ?? "",
    }))
    .filter((v: any) => v.thumbnail && v.id);
}

export async function getVideoById(videoId: string): Promise<YouTubeVideo> {
  const data = await request<any>("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoId,
  });

  const item = data.items?.[0];
  if (!item) throw new Error(`Video not found: ${videoId}`);

  return mapVideo(item);
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapChannel(item: any): YouTubeChannel {
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description ?? "",
    thumbnail:
      item.snippet.thumbnails?.high?.url ??
      item.snippet.thumbnails?.default?.url ??
      "",
    subscriberCount: parseInt(item.statistics?.subscriberCount ?? "0", 10),
    videoCount: parseInt(item.statistics?.videoCount ?? "0", 10),
    viewCount: parseInt(item.statistics?.viewCount ?? "0", 10),
    customUrl: item.snippet.customUrl,
  };
}

function mapVideo(item: any): YouTubeVideo {
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description ?? "",
    thumbnail:
      item.snippet.thumbnails?.maxres?.url ??
      item.snippet.thumbnails?.high?.url ??
      item.snippet.thumbnails?.default?.url ??
      "",
    publishedAt: item.snippet.publishedAt,
    viewCount: parseInt(item.statistics?.viewCount ?? "0", 10),
    likeCount: parseInt(item.statistics?.likeCount ?? "0", 10),
    commentCount: parseInt(item.statistics?.commentCount ?? "0", 10),
    duration: item.contentDetails?.duration ?? "",
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    tags: item.snippet.tags ?? [],
  };
}
