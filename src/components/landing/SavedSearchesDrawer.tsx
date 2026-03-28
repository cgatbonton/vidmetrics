'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bookmark, Loader2, Trash2, X } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/utils';
import type { SavedChannel } from '@/types/analysis';
import type { StructuredError } from '@/types/api';

const STAGGER_DELAY_MS = 0.05;

interface SavedSearchesDrawerProps {
  saves: SavedChannel[];
  isLoading: boolean;
  onSelectChannel: (channel: SavedChannel) => void;
  onDeleteChannel: (id: string) => Promise<{ error: StructuredError | null }>;
  selectedChannelId?: string;
}

export function SavedSearchesDrawer({
  saves,
  isLoading,
  onSelectChannel,
  onDeleteChannel,
  selectedChannelId,
}: SavedSearchesDrawerProps) {
  const reduced = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent): void {
      setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
  }

  function handleSelect(channel: SavedChannel) {
    onSelectChannel(channel);
    setIsOpen(false);
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    await onDeleteChannel(id);
    setDeletingId(null);
  }

  const backdropMotion = reduced
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      };

  const drawerMotion = reduced
    ? {}
    : {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
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

  const drawer = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
            {...backdropMotion}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl max-h-[70vh] overflow-y-auto px-4 pt-3 pb-6"
            {...drawerMotion}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-white/50" />
                <h2 className="text-sm font-semibold text-white">Saved Searches</h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 text-white/50 hover:text-white transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
              </div>
            )}

            {/* Empty state */}
            {!isLoading && saves.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bookmark className="w-6 h-6 text-white/20 mb-2" />
                <p className="text-xs text-white/50">No saved searches yet</p>
              </div>
            )}

            {/* Channel list */}
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
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => !isDeleting && handleSelect(channel)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !isDeleting) handleSelect(channel); }}
                        className={cn(
                          'group w-full flex items-center gap-3 min-h-[48px] py-3 px-3 rounded-lg text-left transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-white/[0.06] border-l-2 border-l-[var(--vm-gradient-mid)]'
                            : 'hover:bg-white/[0.06] border-l-2 border-l-transparent',
                          isDeleting && 'opacity-50 pointer-events-none',
                        )}
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
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, channel.id)}
                          disabled={isDeleting}
                          className="shrink-0 p-1 rounded text-white/30 hover:text-red-400 hover:bg-white/10 transition-all"
                          aria-label={`Delete ${channel.channelName}`}
                        >
                          {isDeleting
                            ? <Loader2 className="w-3.5 h-3.5 text-white/50 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger button — visible only below lg breakpoint */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 bg-gradient-to-r from-[#FA93FA] via-[#C967E8] to-[#983AD6] rounded-full px-4 py-2 text-sm font-medium text-white shadow-[0_0_16px_rgba(201,103,232,0.35)]"
      >
        <Bookmark className="w-4 h-4" />
        Saved ({saves.length})
      </button>

      {/* Portal-rendered drawer */}
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
