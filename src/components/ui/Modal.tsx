'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useMounted } from '@/hooks/useMounted';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
} as const;

export function Modal({ isOpen, onClose, children, title, size = 'lg' }: ModalProps) {
  const reduced = useReducedMotion();
  const mounted = useMounted();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent): void {
      if (e.key === 'Escape') onCloseRef.current();
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!mounted) return null;

  const motionProps = reduced
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.2 },
      };

  const overlayMotionProps = reduced
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex justify-center items-center overflow-y-auto"
          onClick={onClose}
          {...overlayMotionProps}
        >
          <motion.div
            className={`relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 ${MODAL_SIZES[size]} w-full mx-4 max-h-[calc(100vh-4rem)] overflow-y-auto z-[51]`}
            onClick={(e) => e.stopPropagation()}
            {...motionProps}
          >
            <button
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {title && (
              <h2 className="text-xl font-semibold text-white mb-4">
                {title}
              </h2>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
