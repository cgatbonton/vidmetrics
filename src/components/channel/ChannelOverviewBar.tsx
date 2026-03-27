'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCompact } from '@/lib/utils';
import type { ChannelInfo } from '@/types/analysis';

interface ChannelOverviewBarProps {
  channel: ChannelInfo;
}

export function ChannelOverviewBar({ channel }: ChannelOverviewBarProps) {
  const reduced = useReducedMotion();

  const motionProps = reduced
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      };

  return (
    <motion.div {...motionProps}>
      <GlassCard className="p-4 sm:p-6">
        <div className="flex items-center gap-4 flex-wrap">
          {channel.channelAvatar ? (
            <img
              src={channel.channelAvatar}
              alt={channel.channelName}
              className="w-12 h-12 rounded-full bg-white/5"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/5" />
          )}
          <span className="font-semibold text-white text-lg">
            {channel.channelName}
          </span>
          <div className="hidden sm:block border-l border-white/10 pl-4">
            <span className="text-white/50 text-sm">
              {formatCompact(channel.subscriberCount)} subscribers
            </span>
          </div>
          <div className="hidden sm:block border-l border-white/10 pl-4">
            <span className="text-white/50 text-sm">
              {formatCompact(channel.videoCount)} videos
            </span>
          </div>
          <div className="flex sm:hidden gap-3 w-full text-white/50 text-sm">
            <span>{formatCompact(channel.subscriberCount)} subscribers</span>
            <span>&middot;</span>
            <span>{formatCompact(channel.videoCount)} videos</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
