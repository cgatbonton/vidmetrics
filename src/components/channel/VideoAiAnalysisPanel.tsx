'use client';

import { Sparkles, Lock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useVideoAiAnalysis } from '@/hooks/useVideoAiAnalysis';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ScoredVideo, VideoAiAnalysis } from '@/types/analysis';

interface VideoAiAnalysisPanelProps {
  video: ScoredVideo;
  channelSubs: number;
}

const ANALYSIS_SECTIONS: {
  key: keyof VideoAiAnalysis;
  label: string;
  accent?: boolean;
}[] = [
  { key: 'performanceSummary', label: 'Performance Summary' },
  { key: 'strengthsAndWeaknesses', label: 'Strengths & Weaknesses' },
  { key: 'suggestions', label: 'Suggestions' },
  { key: 'competitiveAngle', label: 'Competitive Angle', accent: true },
];

export function VideoAiAnalysisPanel({
  video,
  channelSubs,
}: VideoAiAnalysisPanelProps) {
  const {
    analysis,
    isLoading,
    isGenerating,
    isAuthenticated,
    error,
    generate,
  } = useVideoAiAnalysis(video, channelSubs);

  const reduced = useReducedMotion();

  if (isLoading) return null;

  const motionProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 8 },
        transition: { duration: 0.3 },
      };

  return (
    <div className="space-y-3">
      {!analysis && !isAuthenticated && (
        <Button variant="ghost" size="sm" disabled>
          <Lock className="w-3.5 h-3.5" />
          Sign in for AI Analysis
        </Button>
      )}

      {!analysis && isAuthenticated && (
        <Button
          variant="gradient"
          size="sm"
          loading={isGenerating}
          onClick={generate}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Analysis
        </Button>
      )}

      {analysis && (
        <Button
          variant="ghost"
          size="sm"
          loading={isGenerating}
          onClick={generate}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate
        </Button>
      )}

      {error && (
        <p className="text-xs text-[#F87171]">{error}</p>
      )}

      <AnimatePresence>
        {analysis && (
          <motion.div key="ai-analysis" {...motionProps}>
            <GlassCard className="p-4 space-y-4">
              {ANALYSIS_SECTIONS.map(({ key, label, accent }) => (
                <div
                  key={key}
                  className={
                    accent
                      ? 'border-l-2 border-[#C967E8] pl-3'
                      : undefined
                  }
                >
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-sm text-white/80 mt-1">
                    {analysis[key]}
                  </p>
                </div>
              ))}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
