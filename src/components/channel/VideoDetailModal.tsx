'use client';

import { Modal } from '@/components/ui/Modal';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ScoreBadge } from '@/components/channel/ScoreBadge';
import { VideoAiAnalysisPanel } from '@/components/channel/VideoAiAnalysisPanel';
import { EngagementRadar } from '@/components/charts/EngagementRadar';
import { ViewsOverTimeChart } from '@/components/charts/ViewsOverTimeChart';
import { computeRadarScores } from '@/lib/metrics';
import { formatCompact, formatPercent } from '@/lib/utils';
import type { ScoredVideo, VmsScoreTier } from '@/types/analysis';

interface VideoDetailModalProps {
  video: ScoredVideo | null;
  isOpen: boolean;
  onClose: () => void;
  channelSubs?: number;
}

function formatRelativeTime(dateStr: string): string {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

const TIER_LABELS: Record<VmsScoreTier, string> = {
  viral: 'Viral',
  hot: 'Hot',
  average: 'Average',
  underperforming: 'Underperforming',
};

const NOOP = () => {};

export function VideoDetailModal({
  video,
  isOpen,
  onClose,
  channelSubs = 0,
}: VideoDetailModalProps) {
  if (!video) return null;

  const radarScores = computeRadarScores({
    engagementRate: video.engagementRate,
    likeRatio: video.likeRatio,
    commentRatio: video.commentRatio,
    viewsPerDay: video.viewsPerDay,
    channelSubs,
    contentScore: 50,
  });

  const metrics: { label: string; value: string; raw?: number }[] = [
    { label: 'Views', value: formatCompact(video.viewCount), raw: video.viewCount },
    { label: 'Views/Day', value: formatCompact(Math.round(video.viewsPerDay)), raw: Math.round(video.viewsPerDay) },
    { label: 'Likes', value: formatCompact(video.likeCount), raw: video.likeCount },
    { label: 'Comments', value: formatCompact(video.commentCount), raw: video.commentCount },
    { label: 'Like Ratio', value: formatPercent(video.likeRatio), raw: video.likeRatio },
    { label: 'Comment Ratio', value: formatPercent(video.commentRatio), raw: video.commentRatio },
    { label: 'Engagement Rate', value: formatPercent(video.engagementRate), raw: video.engagementRate },
    { label: 'Duration', value: video.duration },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="max-w-2xl">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full rounded-xl aspect-video object-cover"
        />

        <h2 className="text-lg font-semibold text-white mt-4">
          {video.title}
        </h2>
        <p className="text-xs text-white/50 mt-1">
          {formatRelativeTime(video.publishedAt)}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <ScoreBadge score={video.vmsScore} tier={video.vmsTier} size="md" />
          <span className="text-sm text-white/70">
            {TIER_LABELS[video.vmsTier]}
          </span>
        </div>

        <div className="mt-4">
          <VideoAiAnalysisPanel video={video} channelSubs={channelSubs} />
        </div>

        <div className="mt-6">
          <EngagementRadar scores={radarScores} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {metrics.map((metric) => (
            <GlassCard key={metric.label} className="p-3">
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
                {metric.label}
              </p>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {metric.raw !== undefined ? (
                  <AnimatedCounter
                    target={metric.raw}
                    formatter={() => metric.value}
                  />
                ) : (
                  metric.value
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="mt-6">
          <ViewsOverTimeChart
            snapshots={[]}
            publishedAt={video.publishedAt}
            currentViews={video.viewCount}
            onDateRangeChange={NOOP}
          />
        </div>
      </div>
    </Modal>
  );
}
