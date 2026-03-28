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
import { checkRateLimit, getClientIp, analyzeLimiter, analyzeAuthLimiter } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";
import { emitEvent } from "@/lib/events";
import type { Actor } from "@/types/api";
import type { ChannelAnalysisResponse } from "@/types/analysis";

async function handleVideoAnalysis(videoId: string, url: string, actor: Actor) {
  const authenticated = !isAnonymous(actor);

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

  if (authenticated) {
    const supabase = await createServerClient();
    await supabase.from("metric_snapshots").insert({
      video_id: videoId,
      view_count: analysis.viewCount,
      like_count: analysis.likeCount,
      comment_count: analysis.commentCount,
    });
  }

  await Promise.all([
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

  return NextResponse.json({
    entity: analysis,
    constraints: { canSave: authenticated },
    nextActions: authenticated
      ? ["save_analysis", "analyze_another", "view_channel"]
      : ["sign_up", "analyze_another"],
  });
}

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

const AI_ANALYSIS_LIMIT = 25;

async function handleChannelAnalysis(
  identifier: { type: "handle" | "id" | "custom"; value: string },
  url: string,
  actor: Actor
) {
  const authenticated = !isAnonymous(actor);

  let channelId: string;

  try {
    channelId = await resolveChannelId(identifier);
  } catch {
    return errorResponse("CHANNEL_NOT_FOUND");
  }

  let channelData;
  let rawVideos;
  try {
    [channelData, rawVideos] = await Promise.all([
      fetchChannelWithAvatar(channelId),
      fetchRecentVideos(channelId),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message === "CHANNEL_NOT_FOUND") {
      return errorResponse("CHANNEL_NOT_FOUND");
    }
    return errorResponse("YOUTUBE_API_ERROR");
  }

  if (!rawVideos || rawVideos.length === 0) {
    return errorResponse("NO_RECENT_VIDEOS");
  }

  const vmsInput = mapRawVideosToVmsInput(rawVideos);
  const allScoredVideos = computeVmsScores(vmsInput);

  const { labeledVideos, breakdown } = classifyContentTypes(allScoredVideos);

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
      videos: labeledVideos.slice(0, AI_ANALYSIS_LIMIT),
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

  await Promise.all([
    auditLog({
      actor,
      action: "channel_analysis.completed",
      target: channelId,
      context: { url },
      outcome: {
        channelName: channelData.title,
        videosScored: labeledVideos.length,
      },
    }),
    emitEvent({
      type: "channel_analysis.completed",
      entityId: channelId,
      data: {
        channelName: channelData.title,
        videosScored: labeledVideos.length,
      },
    }),
  ]);

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

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.json().catch(() => null);

  if (!body?.url) {
    return errorResponse("VALIDATION_ERROR");
  }

  const actor = await getActor();
  const identifier = isAnonymous(actor) ? getClientIp(request) : actor.id;
  const limiter = isAnonymous(actor) ? analyzeLimiter : analyzeAuthLimiter;
  const rl = await checkRateLimit(limiter, identifier);
  if (rl.limited) return rl.response;

  const channelIdentifier = extractChannelIdentifier(body.url);
  if (channelIdentifier) return handleChannelAnalysis(channelIdentifier, body.url, actor);

  const videoId = extractVideoId(body.url);
  if (videoId) return handleVideoAnalysis(videoId, body.url, actor);

  return errorResponse("INVALID_CHANNEL_URL");
}
