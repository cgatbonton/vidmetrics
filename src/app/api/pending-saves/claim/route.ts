import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/errors";
import { getAuthenticatedActor } from "@/lib/auth/get-actor";
import { insertSavedChannel } from "@/lib/db/saved-channels";
import { checkRateLimit, crudLimiter } from "@/lib/rate-limit";
import type { ChannelAnalysis } from "@/types/analysis";

const STALE_THRESHOLD_HOURS = 24;

export async function POST(): Promise<Response> {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return errorResponse("PERMISSION_DENIED");
  }

  const rl = await checkRateLimit(crudLimiter, actor.id);
  if (rl.limited) return rl.response;

  const email = actor.humanPrincipal;
  if (!email) {
    return NextResponse.json({ entity: [], constraints: {}, nextActions: [] });
  }

  const supabase = await createServerClient();
  const staleThreshold = new Date(Date.now() - STALE_THRESHOLD_HOURS * 60 * 60 * 1000).toISOString();

  const [, { data: pendingRows, error: fetchError }] = await Promise.all([
    supabase.from("pending_saves").delete().lt("created_at", staleThreshold),
    supabase.from("pending_saves").select("*").eq("email", email),
  ]);

  if (fetchError || !pendingRows?.length) {
    return NextResponse.json({ entity: [], constraints: {}, nextActions: [] });
  }

  const savedResults = [];
  const claimedIds: string[] = [];

  for (const row of pendingRows) {
    const channelData = row.channel_data as ChannelAnalysis;
    claimedIds.push(row.id);

    const { saved } = await insertSavedChannel(
      supabase, actor, channelData, { source: "pending_claim" },
    );

    if (saved) {
      savedResults.push(saved);
    }
  }

  if (claimedIds.length > 0) {
    await supabase.from("pending_saves").delete().in("id", claimedIds);
  }

  return NextResponse.json({
    entity: savedResults,
    constraints: { canViewDashboard: savedResults.length > 0 },
    nextActions: savedResults.length > 0 ? ["view_dashboard"] : [],
  });
}
