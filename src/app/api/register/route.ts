import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { emitEvent } from "@/lib/events";
import { auditLog } from "@/lib/audit";
import { createErrorResponse } from "@/lib/errors";

export async function POST(req: Request) {
  const actor = { type: "system" as const, id: "registration" };

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return createErrorResponse(
      "VALIDATION_ERROR",
      "Invalid request body",
      "Send a JSON body with email and password",
      400
    );
  }

  const { email, password } = body;

  if (!email || !password) {
    return createErrorResponse(
      "VALIDATION_ERROR",
      "Email and password are required",
      "Provide both email and password fields",
      400
    );
  }

  if (password.length < 8) {
    return createErrorResponse(
      "VALIDATION_ERROR",
      "Password must be at least 8 characters",
      "Choose a longer password",
      400
    );
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    const isAlreadyRegistered =
      error.message?.toLowerCase().includes("already registered") ||
      error.message?.toLowerCase().includes("already been registered");
    if (isAlreadyRegistered) {
      return createErrorResponse(
        "EMAIL_TAKEN",
        "An account with this email already exists",
        "Try logging in instead, or use a different email",
        409
      );
    }
    return createErrorResponse(
      "REGISTRATION_FAILED",
      "Unable to create account",
      "Check your email and password and try again",
      400
    );
  }

  const userId = data.user?.id ?? "unknown";

  await Promise.all([
    auditLog({
      actor,
      action: "user.register",
      target: userId,
      outcome: { success: true },
    }),
    emitEvent({
      type: "user.created",
      entityId: userId,
      data: { registered: true },
    }),
  ]);

  return NextResponse.json({
    entity: { id: userId },
    constraints: { canSave: true },
    nextActions: ["analyze_video"],
  });
}
