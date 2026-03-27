'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Save } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';
import { ChannelOverviewBar } from '@/components/channel/ChannelOverviewBar';
import { VideoGrid } from '@/components/channel/VideoGrid';
import { VideoDetailModal } from '@/components/channel/VideoDetailModal';
import type { ChannelAnalysis, ScoredVideo } from '@/types/analysis';

interface AnalyticsSectionProps {
  data: ChannelAnalysis;
  onSave?: () => void;
  canSave?: boolean;
}

export function AnalyticsSection({ data, onSave, canSave }: AnalyticsSectionProps) {
  const reduced = useReducedMotion();
  const [selectedVideo, setSelectedVideo] = useState<ScoredVideo | null>(null);

  const handleVideoClick = (video: ScoredVideo) => {
    setSelectedVideo(video);
  };

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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        {...containerProps}
      >
        <ChannelOverviewBar channel={data.channel} />

        <div className="mt-8">
          <VideoGrid videos={data.videos} onVideoClick={handleVideoClick} />
        </div>

        <VideoDetailModal
          video={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />

        {canSave && onSave && (
          <div className="flex justify-center mt-8">
            <Button variant="gradient" onClick={onSave}>
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Analytics
              </span>
            </Button>
          </div>
        )}
      </motion.div>
  );
}
