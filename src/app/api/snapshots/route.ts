import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/errors";
import { checkRateLimit, getClientIp, crudLimiter } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const rl = await checkRateLimit(crudLimiter, getClientIp(request));
  if (rl.limited) return rl.response;

  const videoId = request.nextUrl.searchParams.get("videoId");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  if (!videoId) {
    return errorResponse("VALIDATION_ERROR");
  }

  const supabase = await createServerClient();
  let query = supabase
    .from("metric_snapshots")
    .select("id, video_id, view_count, like_count, comment_count, recorded_at")
    .eq("video_id", videoId)
    .order("recorded_at", { ascending: true });

  if (from) query = query.gte("recorded_at", from);
  if (to) query = query.lte("recorded_at", to);

  const { data: snapshots, error } = await query;

  if (error) {
    return errorResponse("INTERNAL_ERROR");
  }

  const entity = (snapshots ?? []).map((s) => ({
    id: s.id,
    videoId: s.video_id,
    viewCount: s.view_count,
    likeCount: s.like_count,
    commentCount: s.comment_count,
    recordedAt: s.recorded_at,
  }));

  return NextResponse.json({
    entity,
    constraints: {},
    nextActions: ["analyze_video"],
  });
}
