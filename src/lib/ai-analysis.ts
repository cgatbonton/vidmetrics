import openai from "@/lib/openai";
import type {
  ChannelInfo,
  LabeledVideo,
  ContentTypeBreakdown,
  AiAnalysis,
} from "@/types/analysis";

interface AiAnalysisInput {
  channel: ChannelInfo;
  videos: LabeledVideo[];
  contentTypes: ContentTypeBreakdown[];
}

const PROMPT_TOP_VIDEOS = 10;

function buildPrompt(input: AiAnalysisInput): string {
  const { channel, videos, contentTypes } = input;

  const contentTypeLines = contentTypes
    .map(
      (ct) =>
        `- ${ct.type}: ${ct.count} videos, avg VMS ${ct.avgVmsScore}/100, avg views ${ct.avgViews.toLocaleString()}`
    )
    .join("\n");

  const topVideos = videos
    .slice(0, PROMPT_TOP_VIDEOS)
    .map(
      (v) =>
        `- "${v.title}" [${v.contentType}] — VMS ${v.vmsScore}, ${v.viewCount.toLocaleString()} views, ${v.likeCount.toLocaleString()} likes, ${v.commentCount.toLocaleString()} comments, ${v.duration}`
    )
    .join("\n");

  return `You are a YouTube competitive intelligence analyst. Analyze this channel's recent performance and produce a concise strategic summary.

CHANNEL: ${channel.channelName}
Subscribers: ${channel.subscriberCount.toLocaleString()}
Total videos: ${channel.videoCount.toLocaleString()}
Videos analyzed: ${videos.length}

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

  function toAiAnalysis(parsed: Record<string, unknown>): AiAnalysis {
    return {
      whatsWorking: String(parsed.whatsWorking ?? ""),
      contentStrategy: String(parsed.contentStrategy ?? ""),
      opportunityGaps: String(parsed.opportunityGaps ?? ""),
      keyTakeaway: String(parsed.keyTakeaway ?? ""),
    };
  }

  try {
    return toAiAnalysis(JSON.parse(raw));
  } catch {
    const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    try {
      return toAiAnalysis(JSON.parse(cleaned));
    } catch {
      return { whatsWorking: raw, contentStrategy: "", opportunityGaps: "", keyTakeaway: "" };
    }
  }
}
