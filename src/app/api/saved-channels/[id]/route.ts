import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/errors";
import { getAuthenticatedActor } from "@/lib/auth/get-actor";
import { checkRateLimit, crudLimiter } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";
import { emitEvent } from "@/lib/events";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return errorResponse("PERMISSION_DENIED");
  }

  const rl = await checkRateLimit(crudLimiter, actor.id);
  if (rl.limited) return rl.response;

  const { id } = await params;

  const supabase = await createServerClient();

  const { data: existing } = await supabase
    .from("saved_channels")
    .select("id, channel_id, channel_name")
    .eq("id", id)
    .eq("user_id", actor.id)
    .maybeSingle();

  if (!existing) {
    return errorResponse("ENTITY_NOT_FOUND");
  }

  const { error } = await supabase
    .from("saved_channels")
    .delete()
    .eq("id", id)
    .eq("user_id", actor.id);

  if (error) {
    return errorResponse("INTERNAL_ERROR");
  }

  await Promise.all([
    auditLog({
      actor,
      action: "channel.deleted",
      target: id,
      context: { channelId: existing.channel_id },
      outcome: { channelName: existing.channel_name },
    }),
    emitEvent({
      type: "channel.deleted",
      entityId: id,
      data: { channelId: existing.channel_id, channelName: existing.channel_name },
    }),
  ]);

  return NextResponse.json({
    entity: { id },
    constraints: {},
    nextActions: ["analyze_another"],
  });
}
