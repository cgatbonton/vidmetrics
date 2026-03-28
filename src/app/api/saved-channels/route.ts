import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/errors";
import { getAuthenticatedActor } from "@/lib/auth/get-actor";
import { insertSavedChannel } from "@/lib/db/saved-channels";
import { mapSavedChannelRecord } from "@/lib/db/mappers";

export async function GET(): Promise<Response> {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return errorResponse("PERMISSION_DENIED");
  }

  const supabase = await createServerClient();
  const { data: records, error } = await supabase
    .from("saved_channels")
    .select("*")
    .eq("user_id", actor.id)
    .order("saved_at", { ascending: false });

  if (error) {
    return errorResponse("INTERNAL_ERROR");
  }

  const parsed = (records ?? []).map(mapSavedChannelRecord);

  return NextResponse.json({
    entity: parsed,
    constraints: { canCreate: true },
    nextActions: ["save_channel", "view_channel"],
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return errorResponse("PERMISSION_DENIED");
  }

  const body = await request.json().catch(() => null);

  const REQUIRED_FIELDS = [
    "channelId", "channelName", "channelAvatar",
    "subscriberCount", "videoCount",
    "videos", "contentTypes", "aiAnalysis",
  ] as const;

  const missingField = REQUIRED_FIELDS.some((field) => body?.[field] == null);
  if (!body || missingField) {
    return errorResponse("VALIDATION_ERROR");
  }

  const supabase = await createServerClient();

  const analysis = {
    channel: {
      channelId: body.channelId,
      channelName: body.channelName,
      channelAvatar: body.channelAvatar,
      subscriberCount: body.subscriberCount,
      videoCount: body.videoCount,
    },
    videos: body.videos,
    contentTypes: body.contentTypes,
    aiAnalysis: body.aiAnalysis,
  };

  const { saved, duplicate } = await insertSavedChannel(supabase, actor, analysis as never);

  if (duplicate) {
    return errorResponse("DUPLICATE_SAVE");
  }

  if (!saved) {
    return errorResponse("INTERNAL_ERROR");
  }

  return NextResponse.json(
    {
      entity: saved,
      constraints: { canDelete: true, canView: true },
      nextActions: ["view_channel", "delete_channel", "analyze_another"],
    },
    { status: 201 }
  );
}
