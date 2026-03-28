import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/errors";
import { getAuthenticatedActor } from "@/lib/auth/get-actor";
import { checkRateLimit, crudLimiter } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";
import { emitEvent } from "@/lib/events";
import { mapSavedAnalysisRecord } from "@/lib/db/mappers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) return errorResponse("PERMISSION_DENIED");

  const rl = await checkRateLimit(crudLimiter, actor.id);
  if (rl.limited) return rl.response;

  const { id } = await params;
  const supabase = await createServerClient();

  const { data: record } = await supabase
    .from("saved_analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", actor.id)
    .maybeSingle();

  if (!record) {
    return errorResponse("ENTITY_NOT_FOUND");
  }

  return NextResponse.json({
    entity: mapSavedAnalysisRecord(record),
    constraints: { canDelete: true },
    nextActions: ["delete_analysis", "view_all_saves", "analyze_another"],
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) return errorResponse("PERMISSION_DENIED");

  const rl = await checkRateLimit(crudLimiter, actor.id);
  if (rl.limited) return rl.response;

  const { id } = await params;
  const supabase = await createServerClient();

  const { data: record } = await supabase
    .from("saved_analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", actor.id)
    .maybeSingle();

  if (!record) {
    return errorResponse("ENTITY_NOT_FOUND");
  }

  await supabase.from("saved_analyses").delete().eq("id", id);

  await Promise.all([
    auditLog({
      actor,
      action: "analysis.deleted",
      target: id,
      context: { videoId: record.video_id },
      outcome: { videoTitle: record.video_title },
    }),
    emitEvent({
      type: "analysis.deleted",
      entityId: id,
      data: { videoId: record.video_id, videoTitle: record.video_title },
    }),
  ]);

  return NextResponse.json({
    entity: { id, deleted: true },
    constraints: {},
    nextActions: ["view_all_saves", "analyze_another"],
  });
}
