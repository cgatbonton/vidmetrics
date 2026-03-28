import { callAi, parseAiJson } from "@/lib/ai-utils";
import type { ScoredVideo, VideoAiAnalysis } from "@/types/analysis";

interface VideoAiAnalysisInput {
  video: ScoredVideo;
  channelSubs: number;
}

function buildPrompt(input: VideoAiAnalysisInput): string {
  const { video, channelSubs } = input;

  return `You are a YouTube competitive intelligence analyst. Analyze this single video's performance and produce a concise strategic breakdown.

VIDEO: "${video.title}"
Published: ${video.publishedAt}
Duration: ${video.duration}

METRICS:
- Views: ${video.viewCount.toLocaleString()}
- Likes: ${video.likeCount.toLocaleString()}
- Comments: ${video.commentCount.toLocaleString()}
- Engagement rate: ${(video.engagementRate * 100).toFixed(2)}%
- Like ratio: ${(video.likeRatio * 100).toFixed(2)}%
- Comment ratio: ${(video.commentRatio * 100).toFixed(4)}%
- Views/day: ${video.viewsPerDay.toLocaleString()}
- VMS score: ${video.vmsScore}/100 (${video.vmsTier})

CHANNEL CONTEXT:
- Subscribers: ${channelSubs.toLocaleString()}

Respond with EXACTLY this JSON structure (no markdown, no code fences):
{
  "performanceSummary": "2-3 sentences on how this video performed relative to the channel's subscriber base. Highlight view velocity and whether the VMS score suggests breakout or underperformance.",
  "strengthsAndWeaknesses": "2-3 sentences identifying what this video does well and where it falls short. Compare engagement metrics against each other (e.g., high likes but low comments signals passive consumption).",
  "suggestions": "2-3 sentences of actionable improvements. Be specific about what could change in format, length, or engagement hooks based on the metrics.",
  "competitiveAngle": "2-3 sentences framing this video from a rival's perspective. What would a competitor learn or exploit from this video's performance data?"
}

Rules:
- Be specific. Reference the actual metrics and video title.
- Frame at least one section from a rival's perspective. Use phrasing like "A competing creator could...", "This signals to competitors that...", or "Rivals should note...".
- Keep each section to 2-3 sentences max.
- Do not repeat metrics verbatim. Interpret them.`;
}

function toVideoAiAnalysis(parsed: Record<string, unknown>): VideoAiAnalysis {
  return {
    performanceSummary: String(parsed.performanceSummary ?? ""),
    strengthsAndWeaknesses: String(parsed.strengthsAndWeaknesses ?? ""),
    suggestions: String(parsed.suggestions ?? ""),
    competitiveAngle: String(parsed.competitiveAngle ?? ""),
  };
}

export async function generateVideoAiAnalysis(
  input: VideoAiAnalysisInput
): Promise<VideoAiAnalysis> {
  const raw = await callAi(buildPrompt(input));

  return parseAiJson(raw, toVideoAiAnalysis, {
    performanceSummary: raw,
    strengthsAndWeaknesses: "",
    suggestions: "",
    competitiveAngle: "",
  });
}
