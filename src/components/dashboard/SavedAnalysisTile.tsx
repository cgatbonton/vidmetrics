'use client';

import { motion } from 'motion/react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { SavedAnalysis } from '@/types/analysis';

interface SavedAnalysisTileProps {
  analysis: SavedAnalysis;
  onClick: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SavedAnalysisTile({ analysis, onClick }: SavedAnalysisTileProps) {
  const reduced = useReducedMotion();

  const motionProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <motion.div {...motionProps}>
      <GlassCard
        hoverable
        onClick={onClick}
        className="cursor-pointer overflow-hidden"
      >
        <img
          src={analysis.thumbnailUrl}
          alt={analysis.videoTitle}
          className="w-full aspect-video object-cover rounded-t-xl"
        />
        <div className="p-4">
          <p className="text-sm font-medium text-white truncate">
            {analysis.videoTitle}
          </p>
          <p className="text-xs text-white/50 mt-1">{analysis.channelName}</p>
          <p className="text-xs text-white/40 mt-2">
            {formatDate(analysis.analyzedAt)}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
