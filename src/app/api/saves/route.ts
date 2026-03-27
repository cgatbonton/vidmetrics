import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/errors";
import { getAuthenticatedActor } from "@/lib/auth/get-actor";
import { auditLog } from "@/lib/audit";
import { emitEvent } from "@/lib/events";
import { mapSavedAnalysisRecord } from "@/lib/db/mappers";

export async function GET() {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return errorResponse("PERMISSION_DENIED");
  }

  const supabase = await createServerClient();
  const { data: records, error } = await supabase
    .from("saved_analyses")
    .select("*")
    .eq("user_id", actor.id)
    .order("analyzed_at", { ascending: false });

  if (error) {
    return errorResponse("INTERNAL_ERROR");
  }

  const parsed = (records ?? []).map(mapSavedAnalysisRecord);

  return NextResponse.json({
    entity: parsed,
    constraints: { canCreate: true },
    nextActions: ["save_analysis", "view_analysis"],
  });
}

export async function POST(request: NextRequest) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return errorResponse("PERMISSION_DENIED");
  }

  const body = await request.json().catch(() => null);

  if (
    !body?.videoId ||
    !body?.videoTitle ||
    !body?.thumbnailUrl ||
    !body?.channelName ||
    !body?.metrics
  ) {
    return errorResponse("VALIDATION_ERROR");
  }

  const supabase = await createServerClient();

  const { data: existing } = await supabase
    .from("saved_analyses")
    .select("id")
    .eq("user_id", actor.id)
    .eq("video_id", body.videoId)
    .maybeSingle();

  if (existing) {
    return errorResponse("DUPLICATE_SAVE");
  }

  const { data: saved, error } = await supabase
    .from("saved_analyses")
    .insert({
      user_id: actor.id,
      video_id: body.videoId,
      video_title: body.videoTitle,
      thumbnail_url: body.thumbnailUrl,
      channel_name: body.channelName,
      metrics: typeof body.metrics === "string" ? JSON.parse(body.metrics) : body.metrics,
    })
    .select()
    .single();

  if (error || !saved) {
    return errorResponse("INTERNAL_ERROR");
  }

  await Promise.all([
    auditLog({
      actor,
      action: "analysis.saved",
      target: saved.id,
      context: { videoId: body.videoId },
      outcome: { videoTitle: body.videoTitle, channelName: body.channelName },
    }),
    emitEvent({
      type: "analysis.saved",
      entityId: saved.id,
      data: { videoId: body.videoId, videoTitle: body.videoTitle },
    }),
  ]);

  const result = mapSavedAnalysisRecord(saved);

  return NextResponse.json(
    {
      entity: result,
      constraints: { canDelete: true, canView: true },
      nextActions: ["view_analysis", "delete_analysis", "analyze_another"],
    },
    { status: 201 }
  );
}
