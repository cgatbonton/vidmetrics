import { NextResponse, type NextRequest } from "next/server";
import { extractVideoId, extractChannelIdentifier, parseDurationToSeconds } from "@/lib/utils";
import { errorResponse } from "@/lib/errors";
import {
  fetchVideoData,
  fetchChannelData,
  computeAnalysis,
  resolveChannelId,
  fetchChannelWithAvatar,
  fetchRecentVideos,
} from "@/lib/youtube";
import { computeVmsScores, type VmsVideoInput } from "@/lib/metrics";
import { classifyContentTypes } from "@/lib/content-types";
import { generateAiAnalysis } from "@/lib/ai-analysis";
import { createServerClient } from "@/lib/supabase/server";
import { getActor, isAnonymous } from "@/lib/auth/get-actor";
import { auditLog } from "@/lib/audit";
import { emitEvent } from "@/lib/events";
import type { ChannelAnalysisResponse } from "@/types/analysis";

// --- Single-video analysis (backward compatibility) ---

async function handleVideoAnalysis(videoId: string, url: string) {
  let videoItem;
  let channelItem;

  try {
    videoItem = await fetchVideoData(videoId);
    channelItem = await fetchChannelData(videoItem.snippet.channelId);
  } catch (error) {
    if (error instanceof Error && error.message === "VIDEO_NOT_FOUND") {
      return errorResponse("VIDEO_NOT_FOUND");
    }
    return errorResponse("YOUTUBE_API_ERROR");
  }

  const analysis = computeAnalysis(videoItem, channelItem);
  const actor = await getActor();
  const authenticated = !isAnonymous(actor);

  if (authenticated) {
    const supabase = await createServerClient();
    await Promise.all([
      supabase.from("metric_snapshots").insert({
        video_id: videoId,
        view_count: analysis.viewCount,
        like_count: analysis.likeCount,
        comment_count: analysis.commentCount,
      }),
      auditLog({
        actor,
        action: "analysis.completed",
        target: videoId,
        context: { url },
        outcome: { title: analysis.title, channelName: analysis.channelName },
      }),
      emitEvent({
        type: "analysis.completed",
        entityId: videoId,
        data: { title: analysis.title, channelName: analysis.channelName },
      }),
    ]);
  }

  return NextResponse.json({
    entity: analysis,
    constraints: { canSave: authenticated },
    nextActions: authenticated
      ? ["save_analysis", "analyze_another", "view_channel"]
      : ["sign_up", "analyze_another"],
  });
}

// --- Channel analysis (primary flow) ---

function mapRawVideosToVmsInput(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawVideos: any[]
): VmsVideoInput[] {
  return rawVideos.map((item) => {
    const isoDuration = item.contentDetails?.duration ?? "PT0S";
    return {
      videoId: item.id,
      title: item.snippet?.title ?? "",
      thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? "",
      publishedAt: item.snippet?.publishedAt ?? "",
      duration: isoDuration,
      durationSeconds: parseDurationToSeconds(isoDuration),
      viewCount: parseInt(item.statistics?.viewCount ?? "0", 10),
      likeCount: parseInt(item.statistics?.likeCount ?? "0", 10),
      commentCount: parseInt(item.statistics?.commentCount ?? "0", 10),
    };
  });
}

const TOP_VIDEOS_LIMIT = 25;

async function handleChannelAnalysis(
  identifier: { type: "handle" | "id" | "custom"; value: string },
  url: string
) {
  let channelId: string;

  try {
    channelId = await resolveChannelId(identifier);
  } catch {
    return errorResponse("CHANNEL_NOT_FOUND");
  }

  let channelData;
  try {
    channelData = await fetchChannelWithAvatar(channelId);
  } catch {
    return errorResponse("CHANNEL_NOT_FOUND");
  }

  let rawVideos;
  try {
    rawVideos = await fetchRecentVideos(channelId);
  } catch {
    return errorResponse("YOUTUBE_API_ERROR");
  }

  if (!rawVideos || rawVideos.length === 0) {
    return errorResponse("NO_RECENT_VIDEOS");
  }

  const vmsInput = mapRawVideosToVmsInput(rawVideos);
  const scoredVideos = computeVmsScores(vmsInput).slice(0, TOP_VIDEOS_LIMIT);

  // Content type classification + AI analysis
  const { labeledVideos, breakdown } = classifyContentTypes(scoredVideos);

  const channelInfo = {
    channelId: channelData.id,
    channelName: channelData.title,
    channelAvatar: channelData.avatarUrl,
    subscriberCount: channelData.subscriberCount,
    videoCount: channelData.videoCount,
  };

  let aiAnalysis;
  try {
    aiAnalysis = await generateAiAnalysis({
      channel: channelInfo,
      videos: labeledVideos,
      contentTypes: breakdown,
    });
  } catch {
    aiAnalysis = {
      whatsWorking: "",
      contentStrategy: "",
      opportunityGaps: "",
      keyTakeaway: "",
    };
  }

  const actor = await getActor();
  const authenticated = !isAnonymous(actor);

  if (authenticated) {
    await Promise.all([
      auditLog({
        actor,
        action: "channel_analysis.completed",
        target: channelId,
        context: { url },
        outcome: {
          channelName: channelData.title,
          videosScored: scoredVideos.length,
        },
      }),
      emitEvent({
        type: "channel_analysis.completed",
        entityId: channelId,
        data: {
          channelName: channelData.title,
          videosScored: scoredVideos.length,
        },
      }),
    ]);
  }

  const response: ChannelAnalysisResponse = {
    entity: {
      channel: channelInfo,
      videos: labeledVideos,
      contentTypes: breakdown,
      aiAnalysis,
    },
    constraints: { canSave: authenticated },
    nextActions: authenticated
      ? ["save_analysis", "analyze_another"]
      : ["sign_up", "analyze_another"],
  };

  return NextResponse.json(response);
}

// --- Route handler ---

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.url) {
    return errorResponse("VALIDATION_ERROR");
  }

  // Primary: try channel analysis
  const channelIdentifier = extractChannelIdentifier(body.url);

  if (channelIdentifier) {
    return handleChannelAnalysis(channelIdentifier, body.url);
  }

  // Fallback: try single-video analysis for backward compatibility
  const videoId = extractVideoId(body.url);

  if (videoId) {
    return handleVideoAnalysis(videoId, body.url);
  }

  // Neither channel nor video URL
  return errorResponse("INVALID_CHANNEL_URL");
}
