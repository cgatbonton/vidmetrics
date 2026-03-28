import openai from "@/lib/openai";

const AI_MODEL = "o4-mini";

export async function callAi(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0]?.message?.content ?? "";
}

export function parseAiJson<T>(
  raw: string,
  mapper: (parsed: Record<string, unknown>) => T,
  fallback: T
): T {
  try {
    return mapper(JSON.parse(raw));
  } catch {
    const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    try {
      return mapper(JSON.parse(cleaned));
    } catch {
      return fallback;
    }
  }
}
