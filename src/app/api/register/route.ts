import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { emitEvent } from "@/lib/events";
import { auditLog } from "@/lib/audit";
import { errorResponse } from "@/lib/errors";
import { checkRateLimit, getClientIp, authLimiter } from "@/lib/rate-limit";
import type { Actor } from "@/types/api";

const REGISTRATION_ACTOR: Actor = { type: "system", id: "registration" };
const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: Request): Promise<Response> {
  const rl = await checkRateLimit(authLimiter, getClientIp(req));
  if (rl.limited) return rl.response;

  const body = await req.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return errorResponse("VALIDATION_ERROR");
  }

  if (body.password.length < MIN_PASSWORD_LENGTH) {
    return errorResponse("PASSWORD_TOO_SHORT");
  }

  const rawPending = body.pendingAnalysis;
  const pendingAnalysis =
    rawPending?.channel?.channelId &&
    rawPending?.channel?.channelName &&
    rawPending?.channel?.channelAvatar &&
    typeof rawPending?.channel?.subscriberCount === 'number' &&
    typeof rawPending?.channel?.videoCount === 'number' &&
    Array.isArray(rawPending?.videos) &&
    rawPending?.contentTypes &&
    rawPending?.aiAnalysis
      ? rawPending
      : null;

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
  });

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";

    if (msg.includes("already registered") || msg.includes("already been registered")) {
      return errorResponse("EMAIL_TAKEN");
    }

    if (msg.includes("rate limit") || error.status === 429) {
      return errorResponse("RATE_LIMITED");
    }

    return errorResponse("REGISTRATION_FAILED");
  }

  const userId = data.user?.id ?? "unknown";

  await Promise.all([
    auditLog({
      actor: REGISTRATION_ACTOR,
      action: "user.register",
      target: userId,
      outcome: { success: true },
    }),
    emitEvent({
      type: "user.created",
      entityId: userId,
      data: { registered: true },
    }),
    ...(pendingAnalysis
      ? [supabase.from("pending_saves").insert({
          email: body.email,
          channel_data: pendingAnalysis,
        })]
      : []),
  ]);

  return NextResponse.json({
    entity: { id: userId },
    constraints: { canSave: true },
    nextActions: ["analyze_video"],
  });
}
