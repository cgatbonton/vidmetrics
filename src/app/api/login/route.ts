import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { emitEvent } from "@/lib/events";
import { auditLog } from "@/lib/audit";
import { errorResponse } from "@/lib/errors";
import { checkRateLimit, getClientIp, authLimiter } from "@/lib/rate-limit";

export async function POST(req: Request): Promise<Response> {
  const rl = await checkRateLimit(authLimiter, getClientIp(req));
  if (rl.limited) return rl.response;

  const body = await req.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return errorResponse("VALIDATION_ERROR");
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error) {
    return errorResponse("LOGIN_FAILED");
  }

  const userId = data.user?.id ?? "unknown";

  await Promise.all([
    auditLog({
      actor: { type: "human", id: userId, humanPrincipal: body.email },
      action: "user.logged_in",
      target: userId,
      outcome: { success: true },
    }),
    emitEvent({
      type: "user.logged_in",
      entityId: userId,
      data: { loggedIn: true, email: body.email },
    }),
  ]);

  return NextResponse.json({
    entity: { id: userId },
    constraints: { canSave: true },
    nextActions: ["analyze_video", "view_saves"],
  });
}
