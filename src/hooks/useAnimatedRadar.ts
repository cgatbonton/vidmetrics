'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const EASE_OUT_CUBIC = (t: number): number => 1 - Math.pow(1 - t, 3);
const DEFAULT_DURATION = 1500;

export function useAnimatedRadar(
  targets: number[],
  duration: number = DEFAULT_DURATION,
  enabled: boolean = true
): number[] {
  const [current, setCurrent] = useState(() =>
    enabled ? targets.map(() => 0) : targets
  );
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
      setCurrent(targets);
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

      setCurrent(targets.map((t) => Math.round(easedProgress * t)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets.join(','), duration, enabled, cleanup]);

  return current;
}
