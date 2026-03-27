import { createServerClient } from "@/lib/supabase/server";
import type { Actor } from "@/types/api";

interface AuditEntry {
  actor: Actor;
  action: string;
  target: string;
  reason?: string;
  context?: Record<string, unknown>;
  outcome: Record<string, unknown>;
}

export async function auditLog(entry: AuditEntry): Promise<void> {
  try {
    const supabase = await createServerClient();
    await supabase.from("audit_logs").insert({
      actor_type: entry.actor.type,
      actor_id: entry.actor.id,
      action: entry.action,
      target: entry.target,
      reason: entry.reason ?? null,
      context: entry.context ?? null,
      outcome: entry.outcome,
    });
  } catch (error) {
    console.error("[audit-log-failed]", entry.action, error);
  }
}
