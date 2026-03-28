export interface RadarScores {
  engagement: number;
  likeStrength: number;
  discussion: number;
  velocity: number;
  optimization: number;
}

export interface VideoAnalysis {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelId: string;
  channelName: string;
  channelSubs: number;
  channelVideos: number;
  publishedAt: string;
  duration: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  likeRatio: number;
  commentRatio: number;
  viewsPerDay: number;
  tags: string[];
  tagCount: number;
  categoryId: number;
  categoryName: string;
  engagementRate: number;
  subscriberReachRatio: number;
  contentScore: number;
  radarScores: RadarScores;
}

export interface AnalysisConstraints {
  canSave: boolean;
}

export interface AnalysisResponse {
  entity: VideoAnalysis;
  constraints: AnalysisConstraints;
  nextActions: string[];
}

export type VmsScoreTier = 'viral' | 'hot' | 'average' | 'underperforming';

export interface ScoredVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  likeRatio: number;
  commentRatio: number;
  viewsPerDay: number;
  engagementRate: number;
  vmsScore: number;
  vmsTier: VmsScoreTier;
}

export interface ChannelInfo {
  channelId: string;
  channelName: string;
  channelAvatar: string;
  subscriberCount: number;
  videoCount: number;
}

export interface ContentTypeBreakdown {
  type: string;
  count: number;
  avgVmsScore: number;
  avgViews: number;
}

export interface AiAnalysis {
  whatsWorking: string;
  contentStrategy: string;
  opportunityGaps: string;
  keyTakeaway: string;
}

export interface LabeledVideo extends ScoredVideo {
  contentType: string;
}

export interface ChannelAnalysis {
  channel: ChannelInfo;
  videos: LabeledVideo[];
  contentTypes: ContentTypeBreakdown[];
  aiAnalysis: AiAnalysis;
}

export interface ChannelAnalysisResponse {
  entity: ChannelAnalysis;
  constraints: AnalysisConstraints;
  nextActions: string[];
}

export interface SavedAnalysis {
  id: string;
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  channelName: string;
  metrics: VideoAnalysis;
  analyzedAt: string;
}

export interface SavedChannel {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  subscriberCount: number;
  videoCount: number;
  videos: LabeledVideo[];
  contentTypes: ContentTypeBreakdown[];
  aiAnalysis: AiAnalysis;
  savedAt: string;
}

export interface MetricSnapshot {
  id: string;
  videoId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  recordedAt: string;
}

export interface VideoAiAnalysis {
  performanceSummary: string;
  strengthsAndWeaknesses: string;
  suggestions: string;
  competitiveAngle: string;
}

export interface SavedVideoAiAnalysis {
  id: string;
  videoId: string;
  analysis: VideoAiAnalysis;
  createdAt: string;
}
