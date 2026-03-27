import type { RadarScores, ScoredVideo, VmsScoreTier } from "@/types/analysis";
import { parseDurationToSeconds, formatDuration } from "@/lib/utils";

// --- Benchmark ranges for log-scale normalization ---

const ENGAGEMENT_MIN = 0.005; // 0.5%
const ENGAGEMENT_MAX = 0.08; // 8%

const LIKE_MIN = 0.003; // 0.3%
const LIKE_MAX = 0.05; // 5%

const DISCUSSION_MIN = 0.0001; // 0.01%
const DISCUSSION_MAX = 0.01; // 1%

const VELOCITY_MIN = 0.001; // views per day / subs
const VELOCITY_MAX = 0.5;

// --- YouTube category lookup ---

const YOUTUBE_CATEGORY_MAP: Record<number, string> = {
  1: "Film & Animation",
  2: "Autos & Vehicles",
  10: "Music",
  15: "Pets & Animals",
  17: "Sports",
  18: "Short Movies",
  19: "Travel & Events",
  20: "Gaming",
  21: "Videoblogging",
  22: "People & Blogs",
  23: "Comedy",
  24: "Entertainment",
  25: "News & Politics",
  26: "Howto & Style",
  27: "Education",
  28: "Science & Technology",
  29: "Nonprofits & Activism",
  30: "Movies",
  31: "Anime/Animation",
  32: "Action/Adventure",
  33: "Classics",
  34: "Comedy",
  35: "Documentary",
  36: "Drama",
  37: "Family",
  38: "Foreign",
  39: "Horror",
  40: "Sci-Fi/Fantasy",
  41: "Thriller",
  42: "Shorts",
  43: "Shows",
  44: "Trailers",
};

export function getCategoryName(categoryId: number): string {
  return YOUTUBE_CATEGORY_MAP[categoryId] ?? "Unknown";
}

// --- Normalization ---

function normalizeLogScale(value: number, min: number, max: number): number {
  if (value <= 0) return 0;
  const clampedValue = Math.max(min, Math.min(max, value));
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const logVal = Math.log(clampedValue);
  return Math.round(((logVal - logMin) / (logMax - logMin)) * 100);
}

// --- Content score ---

const OPTIMAL_DURATION_MIN = 420; // 7 minutes
const OPTIMAL_DURATION_MAX = 1200; // 20 minutes

export function computeContentScore(
  tags: string[],
  durationSeconds: number,
  description: string
): number {
  let score = 0;

  // Has tags (25 pts)
  if (tags.length > 0) score += 25;

  // Duration in optimal range (25 pts)
  if (
    durationSeconds >= OPTIMAL_DURATION_MIN &&
    durationSeconds <= OPTIMAL_DURATION_MAX
  ) {
    score += 25;
  } else if (durationSeconds > 0) {
    // Partial credit for being close
    const distance =
      durationSeconds < OPTIMAL_DURATION_MIN
        ? OPTIMAL_DURATION_MIN - durationSeconds
        : durationSeconds - OPTIMAL_DURATION_MAX;
    const maxDistance = 600; // 10 min away = 0 partial credit
    score += Math.max(0, Math.round(25 * (1 - distance / maxDistance)));
  }

  // Has substantial description (25 pts)
  if (description.length > 100) score += 25;
  else if (description.length > 30) score += 12;

  // Has many tags (25 pts) — richer metadata = better discovery
  if (tags.length >= 10) score += 25;
  else if (tags.length >= 5) score += 15;
  else if (tags.length >= 1) score += 8;

  return Math.min(100, score);
}

// --- Radar scores ---

interface RadarInput {
  engagementRate: number;
  likeRatio: number;
  commentRatio: number;
  viewsPerDay: number;
  channelSubs: number;
  contentScore: number;
}

export function computeRadarScores(input: RadarInput): RadarScores {
  const velocityRatio =
    input.channelSubs > 0 ? input.viewsPerDay / input.channelSubs : 0;

  return {
    engagement: normalizeLogScale(
      input.engagementRate,
      ENGAGEMENT_MIN,
      ENGAGEMENT_MAX
    ),
    likeStrength: normalizeLogScale(input.likeRatio, LIKE_MIN, LIKE_MAX),
    discussion: normalizeLogScale(
      input.commentRatio,
      DISCUSSION_MIN,
      DISCUSSION_MAX
    ),
    velocity: normalizeLogScale(velocityRatio, VELOCITY_MIN, VELOCITY_MAX),
    optimization: input.contentScore,
  };
}

// --- VMS Scoring ---

const VMS_TIER_THRESHOLDS = {
  viral: 90,
  hot: 70,
  average: 40,
} as const;

export function getVmsTier(score: number): VmsScoreTier {
  if (score >= VMS_TIER_THRESHOLDS.viral) return "viral";
  if (score >= VMS_TIER_THRESHOLDS.hot) return "hot";
  if (score >= VMS_TIER_THRESHOLDS.average) return "average";
  return "underperforming";
}

export interface VmsVideoInput {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string; // ISO 8601
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

const VMS_WEIGHTS = {
  viewVelocity: 0.35,
  engagementRate: 0.3,
  likeToViewRatio: 0.15,
  commentToViewRatio: 0.1,
  recencyBoost: 0.1,
} as const;

const RECENCY_DECAY_DAYS = 30;
const MIN_DAYS_SINCE_PUBLISH = 1;
const NORMALIZATION_MIDPOINT = 0.5;

interface RawFactors {
  viewVelocity: number;
  engagementRate: number;
  likeToViewRatio: number;
  commentToViewRatio: number;
  recencyBoost: number;
}

function computeRawFactors(video: VmsVideoInput): RawFactors {
  const daysSincePublish = Math.max(
    MIN_DAYS_SINCE_PUBLISH,
    (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const safeViews = video.viewCount || 1;

  return {
    viewVelocity: video.viewCount / daysSincePublish,
    engagementRate: (video.likeCount + video.commentCount) / safeViews,
    likeToViewRatio: video.likeCount / safeViews,
    commentToViewRatio: video.commentCount / safeViews,
    recencyBoost: Math.exp(-daysSincePublish / RECENCY_DECAY_DAYS),
  };
}

function minMaxNormalize(
  values: number[]
): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => NORMALIZATION_MIDPOINT);
  return values.map((v) => (v - min) / (max - min));
}

export function computeVmsScores(videos: VmsVideoInput[]): ScoredVideo[] {
  if (videos.length === 0) return [];

  // Step 1: Compute raw factors for each video
  const allFactors = videos.map(computeRawFactors);

  // Step 2: Normalize each factor across all videos
  const factorKeys: (keyof RawFactors)[] = [
    "viewVelocity",
    "engagementRate",
    "likeToViewRatio",
    "commentToViewRatio",
    "recencyBoost",
  ];

  const normalized: Record<keyof RawFactors, number[]> = {} as Record<
    keyof RawFactors,
    number[]
  >;
  for (const key of factorKeys) {
    normalized[key] = minMaxNormalize(allFactors.map((f) => f[key]));
  }

  // Step 3: Compute weighted score and build results
  const scored: ScoredVideo[] = videos.map((video, i) => {
    const weighted =
      normalized.viewVelocity[i] * VMS_WEIGHTS.viewVelocity +
      normalized.engagementRate[i] * VMS_WEIGHTS.engagementRate +
      normalized.likeToViewRatio[i] * VMS_WEIGHTS.likeToViewRatio +
      normalized.commentToViewRatio[i] * VMS_WEIGHTS.commentToViewRatio +
      normalized.recencyBoost[i] * VMS_WEIGHTS.recencyBoost;

    const vmsScore = Math.min(100, Math.max(0, Math.round(weighted * 100)));
    const daysSincePublish = Math.max(
      MIN_DAYS_SINCE_PUBLISH,
      (Date.now() - new Date(video.publishedAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const safeViews = video.viewCount || 1;

    return {
      videoId: video.videoId,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      publishedAt: video.publishedAt,
      duration: formatDuration(video.duration),
      durationSeconds: video.durationSeconds,
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
      likeRatio: video.likeCount / safeViews,
      commentRatio: video.commentCount / safeViews,
      viewsPerDay: video.viewCount / daysSincePublish,
      engagementRate: (video.likeCount + video.commentCount) / safeViews,
      vmsScore,
      vmsTier: getVmsTier(vmsScore),
    };
  });

  // Step 4: Sort by vmsScore descending
  scored.sort((a, b) => b.vmsScore - a.vmsScore);

  return scored;
}
