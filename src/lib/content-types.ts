import type { ScoredVideo } from "@/types/analysis";
import type { ContentTypeBreakdown } from "@/types/analysis";

const SHORTS_MAX_SECONDS = 62;

const KEYWORD_RULES: { type: string; patterns: RegExp[] }[] = [
  {
    type: "Tutorial",
    patterns: [
      /\bhow to\b/i,
      /\btutorial\b/i,
      /\bstep[- ]by[- ]step\b/i,
      /\bguide\b/i,
      /\blearn\b/i,
      /\bexplained\b/i,
      /\bfor beginners\b/i,
    ],
  },
  {
    type: "Review",
    patterns: [
      /\breview\b/i,
      /\bunboxing\b/i,
      /\bhands[- ]on\b/i,
      /\bfirst look\b/i,
      /\bvs\.?\b/i,
      /\bcompar/i,
    ],
  },
  {
    type: "Podcast / Interview",
    patterns: [
      /\bpodcast\b/i,
      /\binterview\b/i,
      /\bconversation with\b/i,
      /\bep\.?\s*\d/i,
      /\bepisode\s*\d/i,
      /\bfeat\.?\b/i,
      /\bft\.?\b/i,
      /\bw\/\s/i,
    ],
  },
  {
    type: "Vlog",
    patterns: [
      /\bvlog\b/i,
      /\bday in/i,
      /\ba week in/i,
      /\btravel\b/i,
      /\bgrwm\b/i,
      /\broutine\b/i,
    ],
  },
  {
    type: "News / Update",
    patterns: [
      /\bnews\b/i,
      /\bupdate\b/i,
      /\bannounce/i,
      /\bbreaking\b/i,
      /\bjust (happened|dropped|released)\b/i,
      /\blaunch/i,
    ],
  },
  {
    type: "List / Ranking",
    patterns: [
      /\btop\s*\d/i,
      /\bbest\s*\d/i,
      /\bworst\s*\d/i,
      /\b\d+\s*(things|ways|tips|reasons|mistakes|hacks)\b/i,
      /\branking\b/i,
      /\btier list\b/i,
    ],
  },
  {
    type: "Entertainment",
    patterns: [
      /\bchallenge\b/i,
      /\breact/i,
      /\bprank\b/i,
      /\bfunny\b/i,
      /\btrying\b/i,
      /\bi tried\b/i,
    ],
  },
];

function classifySingleVideo(video: ScoredVideo): string {
  if (video.durationSeconds > 0 && video.durationSeconds <= SHORTS_MAX_SECONDS) {
    return "Short";
  }

  for (const rule of KEYWORD_RULES) {
    if (rule.patterns.some((p) => p.test(video.title))) {
      return rule.type;
    }
  }

  return "Other";
}

export function classifyContentTypes(
  videos: ScoredVideo[]
): { labeledVideos: (ScoredVideo & { contentType: string })[]; breakdown: ContentTypeBreakdown[] } {
  const labeled = videos.map((v) => ({
    ...v,
    contentType: classifySingleVideo(v),
  }));

  const groups = new Map<
    string,
    { count: number; totalVms: number; totalViews: number }
  >();

  for (const v of labeled) {
    const existing = groups.get(v.contentType) ?? {
      count: 0,
      totalVms: 0,
      totalViews: 0,
    };
    existing.count += 1;
    existing.totalVms += v.vmsScore;
    existing.totalViews += v.viewCount;
    groups.set(v.contentType, existing);
  }

  const breakdown: ContentTypeBreakdown[] = Array.from(groups.entries())
    .map(([type, stats]) => ({
      type,
      count: stats.count,
      avgVmsScore: Math.round(stats.totalVms / stats.count),
      avgViews: Math.round(stats.totalViews / stats.count),
    }))
    .sort((a, b) => b.avgVmsScore - a.avgVmsScore);

  return { labeledVideos: labeled, breakdown };
}
