'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { VmsScoreTier } from '@/types/analysis';

interface ScoreBadgeProps {
  score: number;
  tier: VmsScoreTier;
  size?: 'sm' | 'md';
}

const TIER_STYLES: Record<VmsScoreTier, string> = {
  viral:
    'bg-gradient-to-r from-[#FA93FA] to-[#983AD6] text-white shadow-[0_0_12px_rgba(201,103,232,0.4)]',
  hot: 'bg-[#FA93FA] text-white',
  average: 'bg-white/10 text-white/70',
  underperforming: 'bg-white/5 text-white/40',
};

const SIZE_STYLES: Record<'sm' | 'md', string> = {
  sm: 'text-xs px-2 py-0.5 rounded-md',
  md: 'text-sm px-3 py-1 rounded-lg',
};

export function ScoreBadge({ score, tier, size = 'sm' }: ScoreBadgeProps) {
  const reduced = useReducedMotion();
  const isViral = tier === 'viral';

  const glowAnimation =
    isViral && !reduced
      ? {
          animate: {
            boxShadow: [
              '0 0 12px rgba(201,103,232,0.4)',
              '0 0 20px rgba(201,103,232,0.6)',
              '0 0 12px rgba(201,103,232,0.4)',
            ],
          },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
        }
      : {};

  return (
    <motion.span
      className={cn(
        'inline-flex items-center font-semibold font-mono tabular-nums',
        TIER_STYLES[tier],
        SIZE_STYLES[size]
      )}
      {...glowAnimation}
    >
      {score}
    </motion.span>
  );
}
