'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Loader2, Trash2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { GlassCard } from '@/components/ui/GlassCard';
import type { SavedChannel } from '@/types/analysis';
import type { StructuredError } from '@/types/api';

const STAGGER_DELAY_MS = 0.05;

const TIME_UNITS: { max: number; divisor: number; label: string }[] = [
  { max: 60_000, divisor: 1_000, label: 's' },
  { max: 3_600_000, divisor: 60_000, label: 'm' },
  { max: 86_400_000, divisor: 3_600_000, label: 'h' },
  { max: 2_592_000_000, divisor: 86_400_000, label: 'd' },
  { max: Infinity, divisor: 2_592_000_000, label: 'mo' },
];

function formatRelativeDate(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < 10_000) return 'just now';
  for (const unit of TIME_UNITS) {
    if (diff < unit.max) {
      return `${Math.floor(diff / unit.divisor)}${unit.label} ago`;
    }
  }
  return 'long ago';
}

function formatSubscriberCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M subs`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K subs`;
  return `${count} subs`;
}

interface SavedSearchesSidebarProps {
  saves: SavedChannel[];
  isLoading: boolean;
  onSelectChannel: (channel: SavedChannel) => void;
  onDeleteChannel: (id: string) => Promise<{ error: StructuredError | null }>;
  selectedChannelId?: string;
}

export function SavedSearchesSidebar({
  saves,
  isLoading,
  onSelectChannel,
  onDeleteChannel,
  selectedChannelId,
}: SavedSearchesSidebarProps) {
  const reduced = useReducedMotion();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(e: React.MouseEvent | React.KeyboardEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    await onDeleteChannel(id);
    setDeletingId(null);
  }

  const containerMotion = reduced
    ? { initial: false as const }
    : {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      };

  const listVariants = reduced
    ? undefined
    : { animate: { transition: { staggerChildren: STAGGER_DELAY_MS } } };

  const itemVariants = reduced
    ? undefined
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
      };

  return (
    <motion.aside {...containerMotion} className="w-64 shrink-0">
      <GlassCard className="h-full flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-white/5">
          <Bookmark className="w-4 h-4 text-white/50" />
          <h2 className="text-sm font-semibold text-white">Saved Searches</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
            </div>
          )}

          {!isLoading && saves.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bookmark className="w-6 h-6 text-white/20 mb-2" />
              <p className="text-xs text-white/50">No saved searches yet</p>
            </div>
          )}

          {!isLoading && saves.length > 0 && (
            <motion.ul
              className="space-y-1"
              initial="initial"
              animate="animate"
              variants={listVariants}
            >
              {saves.map((channel) => {
                const isSelected = channel.channelId === selectedChannelId;
                const isDeleting = channel.id === deletingId;

                return (
                  <motion.li key={channel.id} variants={itemVariants}>
                    <button
                      type="button"
                      onClick={() => onSelectChannel(channel)}
                      disabled={isDeleting}
                      className={`
                        group w-full flex items-center gap-3 p-2 rounded-lg text-left
                        transition-colors cursor-pointer
                        ${isSelected
                          ? 'bg-white/[0.06] border-l-2 border-l-[var(--vm-gradient-mid)]'
                          : 'hover:bg-white/[0.06] border-l-2 border-l-transparent'
                        }
                        ${isDeleting ? 'opacity-50' : ''}
                      `}
                    >
                      <img
                        src={channel.channelAvatar}
                        alt=""
                        className="w-8 h-8 rounded-full shrink-0 bg-white/5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {channel.channelName}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-white/50 truncate">
                            {formatSubscriberCount(channel.subscriberCount)}
                          </span>
                          <span className="text-xs text-white/30">·</span>
                          <span className="text-xs text-white/50 shrink-0">
                            {formatRelativeDate(channel.savedAt)}
                          </span>
                        </div>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleDelete(e, channel.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDelete(e, channel.id); }}
                        aria-disabled={isDeleting || undefined}
                        className={`shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all ${isDeleting ? 'pointer-events-none' : 'cursor-pointer'}`}
                        aria-label={`Delete ${channel.channelName}`}
                      >
                        {isDeleting
                          ? <Loader2 className="w-3.5 h-3.5 text-white/50 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-[var(--vm-error)]" />
                        }
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </div>
      </GlassCard>
    </motion.aside>
  );
}
