import type { VideoAnalysis } from "@/types/analysis";
import type { ChannelIdentifier } from "@/lib/utils";
import { formatDuration, parseDurationToSeconds } from "@/lib/utils";
import {
  getCategoryName,
  computeContentScore,
  computeRadarScores,
} from "@/lib/metrics";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeVideoSnippet {
  title: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: { high: { url: string } };
  tags?: string[];
  categoryId?: string;
  description?: string;
}

interface YouTubeVideoStatistics {
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

interface YouTubeVideoContentDetails {
  duration: string;
}

interface YouTubeVideoItem {
  id: string;
  snippet: YouTubeVideoSnippet;
  statistics: YouTubeVideoStatistics;
  contentDetails: YouTubeVideoContentDetails;
}

interface YouTubeChannelStatistics {
  subscriberCount: string;
  videoCount: string;
}

interface YouTubeChannelItem {
  id: string;
  snippet: { title: string };
  statistics: YouTubeChannelStatistics;
}

interface YouTubeListResponse<T> {
  items?: T[];
}

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not configured");
  return key;
}

export async function fetchVideoData(
  videoId: string
): Promise<YouTubeVideoItem> {
  const url = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${getApiKey()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`YouTube API responded with status ${res.status}`);
  }

  const data: YouTubeListResponse<YouTubeVideoItem> = await res.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("VIDEO_NOT_FOUND");
  }

  return data.items[0];
}

export async function fetchChannelData(
  channelId: string
): Promise<YouTubeChannelItem> {
  const url = `${YOUTUBE_API_BASE}/channels?part=statistics,snippet&id=${channelId}&key=${getApiKey()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`YouTube API responded with status ${res.status}`);
  }

  const data: YouTubeListResponse<YouTubeChannelItem> = await res.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("CHANNEL_NOT_FOUND");
  }

  return data.items[0];
}

export async function resolveChannelId(
  identifier: ChannelIdentifier
): Promise<string> {
  if (identifier.type === "id") return identifier.value;

  const apiKey = getApiKey();

  if (identifier.type === "handle") {
    const handle = identifier.value.replace(/^@/, "");
    const url = `${YOUTUBE_API_BASE}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`YouTube API responded with status ${res.status}`);
    const data: YouTubeListResponse<{ id: string }> = await res.json();
    if (data.items && data.items.length > 0) return data.items[0].id;
    throw new Error("CHANNEL_NOT_FOUND");
  }

  // type: 'custom' — try forUsername first, fall back to search
  const usernameUrl = `${YOUTUBE_API_BASE}/channels?part=id&forUsername=${encodeURIComponent(identifier.value)}&key=${apiKey}`;
  const usernameRes = await fetch(usernameUrl);
  if (usernameRes.ok) {
    const usernameData: YouTubeListResponse<{ id: string }> =
      await usernameRes.json();
    if (usernameData.items && usernameData.items.length > 0)
      return usernameData.items[0].id;
  }

  // Fallback: search API
  const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(identifier.value)}&maxResults=1&key=${apiKey}`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok)
    throw new Error(`YouTube API responded with status ${searchRes.status}`);
  const searchData = await searchRes.json();
  if (searchData.items && searchData.items.length > 0) {
    return searchData.items[0].snippet.channelId;
  }

  throw new Error("CHANNEL_NOT_FOUND");
}

interface ChannelWithAvatar {
  id: string;
  title: string;
  avatarUrl: string;
  subscriberCount: number;
  videoCount: number;
}

export async function fetchChannelWithAvatar(
  channelId: string
): Promise<ChannelWithAvatar> {
  const url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${channelId}&key=${getApiKey()}`;
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`YouTube API responded with status ${res.status}`);

  const data = await res.json();
  if (!data.items || data.items.length === 0)
    throw new Error("CHANNEL_NOT_FOUND");

  const item = data.items[0];
  return {
    id: item.id,
    title: item.snippet.title,
    avatarUrl: item.snippet.thumbnails?.default?.url ?? "",
    subscriberCount: parseInt(item.statistics.subscriberCount, 10) || 0,
    videoCount: parseInt(item.statistics.videoCount, 10) || 0,
  };
}

const VIDEO_BATCH_SIZE = 50;
const MAX_PLAYLIST_PAGES = 10; // Up to 500 playlist items

export async function fetchRecentVideos(
  channelId: string
): Promise<YouTubeVideoItem[]> {
  const apiKey = getApiKey();

  const channelUrl = `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const channelRes = await fetch(channelUrl);
  if (!channelRes.ok)
    throw new Error(`YouTube API responded with status ${channelRes.status}`);
  const channelData = await channelRes.json();
  if (!channelData.items || channelData.items.length === 0)
    throw new Error("CHANNEL_NOT_FOUND");

  const uploadsPlaylistId =
    channelData.items[0].contentDetails.relatedPlaylists.uploads;

  const allPlaylistItems: { snippet: { publishedAt: string; resourceId: { videoId: string } } }[] = [];
  let nextPageToken: string | undefined;

  for (let page = 0; page < MAX_PLAYLIST_PAGES; page++) {
    const pageParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";
    const playlistUrl = `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${VIDEO_BATCH_SIZE}${pageParam}&key=${apiKey}`;
    const playlistRes = await fetch(playlistUrl);
    if (!playlistRes.ok)
      throw new Error(`YouTube API responded with status ${playlistRes.status}`);
    const playlistData = await playlistRes.json();

    if (!playlistData.items || playlistData.items.length === 0) break;

    allPlaylistItems.push(...playlistData.items);

    nextPageToken = playlistData.nextPageToken;
    if (!nextPageToken) break;
  }

  if (allPlaylistItems.length === 0) return [];

  const videoIds: string[] = allPlaylistItems.map(
    (item) => item.snippet.resourceId.videoId
  );

  const allVideos: YouTubeVideoItem[] = [];
  for (let i = 0; i < videoIds.length; i += VIDEO_BATCH_SIZE) {
    const batch = videoIds.slice(i, i + VIDEO_BATCH_SIZE);
    const videosUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${batch.join(",")}&key=${apiKey}`;
    const videosRes = await fetch(videosUrl);
    if (!videosRes.ok)
      throw new Error(`YouTube API responded with status ${videosRes.status}`);
    const videosData: YouTubeListResponse<YouTubeVideoItem> =
      await videosRes.json();
    if (videosData.items) allVideos.push(...videosData.items);
  }

  return allVideos;
}

export function computeAnalysis(
  videoItem: YouTubeVideoItem,
  channelItem: YouTubeChannelItem
): VideoAnalysis {
  const viewCount = parseInt(videoItem.statistics.viewCount, 10) || 0;
  const likeCount = parseInt(videoItem.statistics.likeCount, 10) || 0;
  const commentCount = parseInt(videoItem.statistics.commentCount, 10) || 0;
  const channelSubs =
    parseInt(channelItem.statistics.subscriberCount, 10) || 0;
  const channelVideos = parseInt(channelItem.statistics.videoCount, 10) || 0;

  const publishedAt = videoItem.snippet.publishedAt;
  const daysSincePublish = Math.max(
    1,
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const likeRatio = viewCount > 0 ? likeCount / viewCount : 0;
  const commentRatio = viewCount > 0 ? commentCount / viewCount : 0;
  const viewsPerDay = viewCount / daysSincePublish;
  const engagementRate =
    viewCount > 0 ? (likeCount + commentCount) / viewCount : 0;
  const subscriberReachRatio = channelSubs > 0 ? viewCount / channelSubs : 0;

  const isoDuration = videoItem.contentDetails.duration;
  const durationSeconds = parseDurationToSeconds(isoDuration);

  const tags = (videoItem.snippet.tags ?? []).slice(0, 10);
  const categoryId = parseInt(videoItem.snippet.categoryId ?? "0", 10);
  const description = videoItem.snippet.description ?? "";

  const contentScore = computeContentScore(tags, durationSeconds, description);
  const radarScores = computeRadarScores({
    engagementRate,
    likeRatio,
    commentRatio,
    viewsPerDay,
    channelSubs,
    contentScore,
  });

  return {
    videoId: videoItem.id,
    title: videoItem.snippet.title,
    thumbnailUrl: videoItem.snippet.thumbnails.high.url,
    channelId: videoItem.snippet.channelId,
    channelName: videoItem.snippet.channelTitle,
    channelSubs,
    channelVideos,
    publishedAt,
    duration: formatDuration(isoDuration),
    durationSeconds,
    viewCount,
    likeCount,
    commentCount,
    likeRatio,
    commentRatio,
    viewsPerDay,
    tags,
    tagCount: tags.length,
    categoryId,
    categoryName: getCategoryName(categoryId),
    engagementRate,
    subscriberReachRatio,
    contentScore,
    radarScores,
  };
}
