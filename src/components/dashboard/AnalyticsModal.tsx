'use client';

import { useState, useEffect, useCallback } from 'react';
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
              <GlassCard className="p-3">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Views</p>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  <AnimatedCounter target={data.viewCount} formatter={formatCompact} />
                </div>
              </GlassCard>
              <GlassCard className="p-3">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Likes</p>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  <AnimatedCounter target={data.likeCount} formatter={formatCompact} />
                </div>
              </GlassCard>
              <GlassCard className="p-3">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Comments</p>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  <AnimatedCounter target={data.commentCount} formatter={formatCompact} />
                </div>
              </GlassCard>
              <GlassCard className="p-3">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Views/Day</p>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  <AnimatedCounter target={data.viewsPerDay} formatter={formatCompact} />
                </div>
              </GlassCard>
              <GlassCard className="p-3">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Like Ratio</p>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  <AnimatedCounter target={data.likeRatio} formatter={formatPercent} />
                </div>
              </GlassCard>
              <GlassCard className="p-3">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Engagement</p>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  <AnimatedCounter target={data.engagementRate} formatter={formatPercent} />
                </div>
              </GlassCard>
              <GlassCard className="p-3">
                <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Content Score</p>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  <AnimatedCounter target={data.contentScore} formatter={formatScore} />
                </div>
              </GlassCard>
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
