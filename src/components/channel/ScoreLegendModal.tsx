'use client';

import { Modal } from '@/components/ui/Modal';
import { ScoreBadge } from '@/components/channel/ScoreBadge';
import type { VmsScoreTier } from '@/types/analysis';

interface ScoreLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FACTORS = [
  { name: 'View Velocity', weight: 35, description: 'How fast views are accumulating' },
  { name: 'Engagement Rate', weight: 30, description: 'Likes + comments relative to views' },
  { name: 'Like-to-View Ratio', weight: 15, description: 'Audience sentiment quality' },
  { name: 'Comment-to-View Ratio', weight: 10, description: 'Conversation generation' },
  { name: 'Recency Boost', weight: 10, description: 'Rewards fresher content' },
] as const;

const TIERS: { tier: VmsScoreTier; label: string; range: string; score: number }[] = [
  { tier: 'viral', label: 'Viral', range: '90-100', score: 95 },
  { tier: 'hot', label: 'Hot', range: '70-89', score: 80 },
  { tier: 'average', label: 'Average', range: '40-69', score: 55 },
  { tier: 'underperforming', label: 'Underperforming', range: '0-39', score: 20 },
];

export function ScoreLegendModal({ isOpen, onClose }: ScoreLegendModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="VidMetrics Score (VMS)">
      <p className="text-sm text-white/70">
        A 0-100 score ranking how well a video performs relative to the
        channel&apos;s recent output.
      </p>

      <div className="mt-6 space-y-4">
        {FACTORS.map((factor) => (
          <div key={factor.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white">
                {factor.name}
              </span>
              <span className="text-xs text-white/50">{factor.weight}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#FA93FA] to-[#983AD6]"
                style={{ width: `${factor.weight}%` }}
              />
            </div>
            <p className="text-xs text-white/40 mt-1">{factor.description}</p>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-white mt-6 mb-3">
        Score Tiers
      </h3>
      <div className="space-y-3">
        {TIERS.map(({ tier, label, range, score }) => (
          <div key={tier} className="flex items-center gap-3">
            <ScoreBadge score={score} tier={tier} size="md" />
            <span className="text-sm text-white">{label}</span>
            <span className="text-xs text-white/50 ml-auto">{range}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/40 italic mt-4">
        Scores are relative to this channel&apos;s recent videos, not absolute
        benchmarks.
      </p>
    </Modal>
  );
}
