import type {
  SavedAnalysis,
  SavedChannel,
  SavedVideoAiAnalysis,
  VideoAnalysis,
  VideoAiAnalysis,
  LabeledVideo,
  ContentTypeBreakdown,
  AiAnalysis,
} from "@/types/analysis";

interface SavedAnalysisRow {
  id: string;
  video_id: string;
  video_title: string;
  thumbnail_url: string;
  channel_name: string;
  metrics: VideoAnalysis;
  analyzed_at: string;
}

export function mapSavedAnalysisRecord(record: SavedAnalysisRow): SavedAnalysis {
  return {
    id: record.id,
    videoId: record.video_id,
    videoTitle: record.video_title,
    thumbnailUrl: record.thumbnail_url,
    channelName: record.channel_name,
    metrics: record.metrics,
    analyzedAt: record.analyzed_at,
  };
}

interface SavedChannelRow {
  id: string;
  channel_id: string;
  channel_name: string;
  channel_avatar: string;
  subscriber_count: number;
  video_count: number;
  videos: LabeledVideo[];
  content_types: ContentTypeBreakdown[];
  ai_analysis: AiAnalysis;
  saved_at: string;
}

export function mapSavedChannelRecord(record: SavedChannelRow): SavedChannel {
  return {
    id: record.id,
    channelId: record.channel_id,
    channelName: record.channel_name,
    channelAvatar: record.channel_avatar,
    subscriberCount: record.subscriber_count,
    videoCount: record.video_count,
    videos: record.videos,
    contentTypes: record.content_types,
    aiAnalysis: record.ai_analysis,
    savedAt: record.saved_at,
  };
}

interface VideoAiAnalysisRow {
  id: string;
  video_id: string;
  analysis: VideoAiAnalysis;
  created_at: string;
}

export function mapVideoAiAnalysisRecord(record: VideoAiAnalysisRow): SavedVideoAiAnalysis {
  return {
    id: record.id,
    videoId: record.video_id,
    analysis: record.analysis,
    createdAt: record.created_at,
  };
}
