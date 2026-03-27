import { createServerClient } from "@/lib/supabase/server";
import type { Actor } from "@/types/api";

export function isAnonymous(actor: Actor): boolean {
  return actor.type === "system" && actor.id === "anonymous";
}

export async function getActor(): Promise<Actor> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return {
      type: "human",
      id: user.id,
      humanPrincipal: user.email ?? undefined,
    };
  }

  return { type: "system", id: "anonymous" };
}

export async function getAuthenticatedActor(): Promise<Actor | null> {
  const actor = await getActor();
  return isAnonymous(actor) ? null : actor;
}
