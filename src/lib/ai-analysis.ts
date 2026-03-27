import openai from "@/lib/openai";
import type { ChannelInfo, ScoredVideo } from "@/types/analysis";
import type { ContentTypeBreakdown, AiAnalysis } from "@/types/analysis";

interface AiAnalysisInput {
  channel: ChannelInfo;
  videos: (ScoredVideo & { contentType: string })[];
  contentTypes: ContentTypeBreakdown[];
}

function buildPrompt(input: AiAnalysisInput): string {
  const { channel, videos, contentTypes } = input;

  const contentTypeLines = contentTypes
    .map(
      (ct) =>
        `- ${ct.type}: ${ct.count} videos, avg VMS ${ct.avgVmsScore}/100, avg views ${ct.avgViews.toLocaleString()}`
    )
    .join("\n");

  const topVideos = videos
    .slice(0, 10)
    .map(
      (v) =>
        `- "${v.title}" [${v.contentType}] — VMS ${v.vmsScore}, ${v.viewCount.toLocaleString()} views, ${v.likeCount.toLocaleString()} likes, ${v.commentCount.toLocaleString()} comments, ${v.duration}`
    )
    .join("\n");

  return `You are a YouTube competitive intelligence analyst. Analyze this channel's recent performance and produce a concise strategic summary.

CHANNEL: ${channel.channelName}
Subscribers: ${channel.subscriberCount.toLocaleString()}
Total videos: ${channel.videoCount.toLocaleString()}
Videos analyzed (last 30 days): ${videos.length}

CONTENT TYPE BREAKDOWN:
${contentTypeLines}

TOP PERFORMING VIDEOS:
${topVideos}

Respond with EXACTLY this JSON structure (no markdown, no code fences):
{
  "whatsWorking": "2-3 sentences comparing content types against each other. Highlight view velocity differences (e.g., 'gaining X views/day vs Y views/day') and explain what's driving the top performers.",
  "contentStrategy": "2-3 sentences on the channel's publishing pattern — estimate frequency, preferred formats, content mix balance, and any cadence patterns (e.g., 'X videos per week', 'Shorts every N days').",
  "opportunityGaps": "2-3 sentences on underrepresented or underperforming content types. Back each gap with data (e.g., 'Only N of M videos are [type] despite averaging X engagement').",
  "keyTakeaway": "One punchy sentence — the single most actionable competitive insight."
}

Rules:
- Be specific. Reference actual content types and video titles.
- Frame insights from a rival's perspective. Use phrasing like "A competing creator could...", "This leaves an opening for rivals to...", or "Competitors should note...". At least one section must explicitly address what an outside competitor would do with this intelligence.
- Keep each section to 2-3 sentences max.
- Do not repeat metrics verbatim. Interpret them.`;
}

export async function generateAiAnalysis(
  input: AiAnalysisInput
): Promise<AiAnalysis> {
  const prompt = buildPrompt(input);

  const completion = await openai.chat.completions.create({
    model: "o4-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(raw);
    return {
      whatsWorking: parsed.whatsWorking ?? "",
      contentStrategy: parsed.contentStrategy ?? "",
      opportunityGaps: parsed.opportunityGaps ?? "",
      keyTakeaway: parsed.keyTakeaway ?? "",
    };
  } catch {
    // If the model wraps in code fences, strip them
    const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return {
        whatsWorking: parsed.whatsWorking ?? "",
        contentStrategy: parsed.contentStrategy ?? "",
        opportunityGaps: parsed.opportunityGaps ?? "",
        keyTakeaway: parsed.keyTakeaway ?? "",
      };
    } catch {
      return {
        whatsWorking: raw,
        contentStrategy: "",
        opportunityGaps: "",
        keyTakeaway: "",
      };
    }
  }
}
