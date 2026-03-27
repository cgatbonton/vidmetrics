import { createServerClient } from "@/lib/supabase/server";

interface EventPayload {
  type: string;
  entityId: string;
  data: Record<string, unknown>;
}

export async function emitEvent(payload: EventPayload): Promise<void> {
  try {
    const supabase = await createServerClient();
    await supabase.from("events").insert({
      type: payload.type,
      entity_id: payload.entityId,
      data: payload.data,
    });
  } catch (error) {
    console.error("[event-emission-failed]", payload.type, error);
  }
}
