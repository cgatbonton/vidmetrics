import type { SavedAnalysis, VideoAnalysis } from "@/types/analysis";

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
