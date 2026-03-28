'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ChannelOverviewBar } from '@/components/channel/ChannelOverviewBar';
import { VideoGrid } from '@/components/channel/VideoGrid';
import { VideoDetailModal } from '@/components/channel/VideoDetailModal';
import type { ChannelAnalysis, ScoredVideo } from '@/types/analysis';

interface AnalyticsSectionProps {
  data: ChannelAnalysis;
  onSave?: () => void;
  sidebarOpen?: boolean;
}

export function AnalyticsSection({ data, onSave, sidebarOpen }: AnalyticsSectionProps) {
  const reduced = useReducedMotion();
  const [selectedVideo, setSelectedVideo] = useState<ScoredVideo | null>(null);

  const containerProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      };

  return (
      <motion.div
        key={data.channel.channelId}
        className={sidebarOpen ? "relative z-10 py-16" : "relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"}
        {...containerProps}
      >
        <ChannelOverviewBar channel={data.channel} />

        <div className="mt-8">
          <VideoGrid videos={data.videos} onVideoClick={setSelectedVideo} onSave={onSave} sidebarOpen={sidebarOpen} />
        </div>

        <VideoDetailModal
          video={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          channelSubs={data.channel.subscriberCount}
        />

      </motion.div>
  );
}
