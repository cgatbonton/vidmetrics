import type { SupabaseClient } from "@supabase/supabase-js";
import { auditLog } from "@/lib/audit";
import { emitEvent } from "@/lib/events";
import { mapSavedChannelRecord } from "@/lib/db/mappers";
import type { ChannelAnalysis, SavedChannel } from "@/types/analysis";
import type { Actor } from "@/types/api";

interface InsertResult {
  saved: SavedChannel | null;
  duplicate: boolean;
}

export async function insertSavedChannel(
  supabase: SupabaseClient,
  actor: Actor,
  analysis: ChannelAnalysis,
  context?: Record<string, string>,
): Promise<InsertResult> {
  const { data: existing } = await supabase
    .from("saved_channels")
    .select("id")
    .eq("user_id", actor.id)
    .eq("channel_id", analysis.channel.channelId)
    .maybeSingle();

  if (existing) {
    return { saved: null, duplicate: true };
  }

  const { data: record, error } = await supabase
    .from("saved_channels")
    .insert({
      user_id: actor.id,
      channel_id: analysis.channel.channelId,
      channel_name: analysis.channel.channelName,
      channel_avatar: analysis.channel.channelAvatar,
      subscriber_count: analysis.channel.subscriberCount,
      video_count: analysis.channel.videoCount,
      videos: analysis.videos,
      content_types: analysis.contentTypes,
      ai_analysis: analysis.aiAnalysis,
    })
    .select()
    .single();

  if (error || !record) {
    return { saved: null, duplicate: false };
  }

  const mapped = mapSavedChannelRecord(record);

  await Promise.all([
    auditLog({
      actor,
      action: "channel.saved",
      target: record.id,
      context: { channelId: analysis.channel.channelId, ...context },
      outcome: { channelName: analysis.channel.channelName },
    }),
    emitEvent({
      type: "channel.saved",
      entityId: record.id,
      data: {
        channelId: analysis.channel.channelId,
        channelName: analysis.channel.channelName,
        ...context,
      },
    }),
  ]);

  return { saved: mapped, duplicate: false };
}
