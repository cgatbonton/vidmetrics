'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useSnapshots } from '@/hooks/useSnapshots';
import { formatCompact, formatPercent, formatScore } from '@/lib/utils';
import type { SavedAnalysis } from '@/types/analysis';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: SavedAnalysis | null;
}

export function AnalyticsModal({ isOpen, onClose, analysis }: AnalyticsModalProps) {
  const [stableAnalysis, setStableAnalysis] = useState(analysis);
  const { fetchSnapshots } = useSnapshots();

  useEffect(() => {
    if (analysis) {
      setStableAnalysis(analysis);
      fetchSnapshots(analysis.videoId);
    }
  }, [analysis, fetchSnapshots]);

  const data = stableAnalysis?.metrics;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={stableAnalysis?.videoTitle ?? ''}>
      <div className="overflow-y-auto max-h-[70vh]">
        {data && (
          <div className="space-y-4">
            <img
              src={data.thumbnailUrl}
              alt={data.title}
              className="w-full rounded-xl aspect-video object-cover"
            />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Views', value: data.viewCount, formatter: formatCompact },
                { label: 'Likes', value: data.likeCount, formatter: formatCompact },
                { label: 'Comments', value: data.commentCount, formatter: formatCompact },
                { label: 'Views/Day', value: data.viewsPerDay, formatter: formatCompact },
                { label: 'Like Ratio', value: data.likeRatio, formatter: formatPercent },
                { label: 'Engagement', value: data.engagementRate, formatter: formatPercent },
                { label: 'Content Score', value: data.contentScore, formatter: formatScore },
              ].map((metric) => (
                <GlassCard key={metric.label} className="p-3">
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{metric.label}</p>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    <AnimatedCounter target={metric.value} formatter={metric.formatter} />
                  </div>
                </GlassCard>
              ))}
              <GlassCard className="p-3">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Duration</p>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {data.duration}
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
