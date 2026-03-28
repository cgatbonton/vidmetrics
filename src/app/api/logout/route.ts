import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { emitEvent } from "@/lib/events";
import { auditLog } from "@/lib/audit";
import { errorResponse } from "@/lib/errors";

export async function POST(): Promise<Response> {
  const supabase = await createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const actor = {
    type: "system" as const,
    id: session?.user?.id ?? "unknown",
  };

  const { error } = await supabase.auth.signOut();

  if (error) {
    return errorResponse("LOGOUT_FAILED");
  }

  await Promise.all([
    auditLog({
      actor,
      action: "user.logged_out",
      target: actor.id,
      outcome: { success: true },
    }),
    emitEvent({
      type: "user.logged_out",
      entityId: actor.id,
      data: { loggedOut: true },
    }),
  ]);

  return NextResponse.json({
    entity: { loggedOut: true },
    constraints: {},
    nextActions: ["login", "sign_up"],
  });
}
