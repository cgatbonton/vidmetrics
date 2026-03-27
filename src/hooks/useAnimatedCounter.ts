'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const EASE_OUT_CUBIC = (t: number): number => 1 - Math.pow(1 - t, 3);
const DEFAULT_DURATION = 1500;

export function useAnimatedCounter(
  target: number,
  duration: number = DEFAULT_DURATION,
  enabled: boolean = true
): number {
  const [current, setCurrent] = useState(enabled ? 0 : target);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setCurrent(target);
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = EASE_OUT_CUBIC(progress);

      setCurrent(Math.round(easedProgress * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return cleanup;
  }, [target, duration, enabled, cleanup]);

  return current;
}
