'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Info } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { VideoTile } from '@/components/channel/VideoTile';
import { ScoreLegendModal } from '@/components/channel/ScoreLegendModal';
import type { ScoredVideo } from '@/types/analysis';

interface VideoGridProps {
  videos: ScoredVideo[];
  onVideoClick: (video: ScoredVideo) => void;
}

export function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  const [legendOpen, setLegendOpen] = useState(false);
  const reduced = useReducedMotion();

  const containerProps = reduced
    ? {}
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
        variants: {
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        },
      };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Top 25 Videos</h2>
        <button
          onClick={() => setLegendOpen(true)}
          className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.08] transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          How scoring works
        </button>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4"
        {...containerProps}
      >
        {videos.map((video) => (
          <VideoTile
            key={video.videoId}
            video={video}
            onClick={() => onVideoClick(video)}
          />
        ))}
      </motion.div>

      <ScoreLegendModal
        isOpen={legendOpen}
        onClose={() => setLegendOpen(false)}
      />
    </div>
  );
}
