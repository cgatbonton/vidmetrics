'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScoreBadge } from '@/components/channel/ScoreBadge';
import type { ScoredVideo } from '@/types/analysis';

interface VideoTileProps {
  video: ScoredVideo;
  onClick: () => void;
}

export function VideoTile({ video, onClick }: VideoTileProps) {
  const reduced = useReducedMotion();

  const motionProps = reduced
    ? { initial: false as const }
    : {
        variants: {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
        },
      };

  return (
    <motion.div {...motionProps}>
      <GlassCard
        hoverable
        className="overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <div className="relative">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full aspect-video object-cover rounded-t-xl"
          />
          <div className="absolute top-2 right-2">
            <ScoreBadge score={video.vmsScore} tier={video.vmsTier} size="sm" />
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-white line-clamp-2">
            {video.title}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
