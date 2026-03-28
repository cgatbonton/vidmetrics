import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/errors";
import { getAuthenticatedActor } from "@/lib/auth/get-actor";
import { auditLog } from "@/lib/audit";
import { emitEvent } from "@/lib/events";
import { mapVideoAiAnalysisRecord } from "@/lib/db/mappers";
import { generateVideoAiAnalysis } from "@/lib/ai-video-analysis";

export async function GET(request: NextRequest) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return errorResponse("PERMISSION_DENIED");
  }

  const videoId = request.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return errorResponse("VALIDATION_ERROR");
  }

  const supabase = await createServerClient();
  const { data: record, error } = await supabase
    .from("video_ai_analyses")
    .select("*")
    .eq("user_id", actor.id)
    .eq("video_id", videoId)
    .maybeSingle();

  if (error) {
    return errorResponse("INTERNAL_ERROR");
  }

  if (record) {
    return NextResponse.json({
      entity: mapVideoAiAnalysisRecord(record),
      constraints: { canRegenerate: true },
      nextActions: ["regenerate_analysis"],
    });
  }

  return NextResponse.json({
    entity: null,
    constraints: { canGenerate: true },
    nextActions: ["generate_analysis"],
  });
}

export async function POST(request: NextRequest) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return errorResponse("PERMISSION_DENIED");
  }

  const body = await request.json().catch(() => null);
  const v = body?.video;

  if (
    !v?.videoId ||
    !v?.title ||
    !v?.publishedAt ||
    !v?.duration ||
    v?.viewCount == null ||
    v?.likeCount == null ||
    v?.commentCount == null ||
    v?.engagementRate == null ||
    v?.likeRatio == null ||
    v?.commentRatio == null ||
    v?.viewsPerDay == null ||
    v?.vmsScore == null ||
    !v?.vmsTier ||
    body?.channelSubs == null
  ) {
    return errorResponse("VALIDATION_ERROR");
  }

  const sanitizedVideo = {
    videoId: v.videoId,
    title: v.title,
    publishedAt: v.publishedAt,
    duration: v.duration,
    viewCount: v.viewCount,
    likeCount: v.likeCount,
    commentCount: v.commentCount,
    engagementRate: v.engagementRate,
    likeRatio: v.likeRatio,
    commentRatio: v.commentRatio,
    viewsPerDay: v.viewsPerDay,
    vmsScore: v.vmsScore,
    vmsTier: v.vmsTier,
  };

  let aiAnalysis;
  try {
    aiAnalysis = await generateVideoAiAnalysis({
      video: sanitizedVideo as typeof body.video,
      channelSubs: body.channelSubs,
    });
  } catch {
    return errorResponse("VIDEO_AI_GENERATION_FAILED");
  }

  const supabase = await createServerClient();

  const { data: saved, error } = await supabase
    .from("video_ai_analyses")
    .upsert(
      {
        user_id: actor.id,
        video_id: sanitizedVideo.videoId,
        analysis: aiAnalysis,
      },
      { onConflict: "user_id,video_id" }
    )
    .select()
    .single();

  if (error || !saved) {
    return errorResponse("INTERNAL_ERROR");
  }

  await Promise.all([
    auditLog({
      actor,
      action: "video_ai_analysis.generated",
      target: saved.id,
      context: { videoId: sanitizedVideo.videoId },
      outcome: { videoId: sanitizedVideo.videoId },
    }),
    emitEvent({
      type: "video_ai_analysis.generated",
      entityId: saved.id,
      data: { videoId: sanitizedVideo.videoId },
    }),
  ]);

  return NextResponse.json(
    {
      entity: mapVideoAiAnalysisRecord(saved),
      constraints: { canRegenerate: true },
      nextActions: ["regenerate_analysis", "view_video"],
    },
    { status: 201 }
  );
}
