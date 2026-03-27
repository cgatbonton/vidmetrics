'use client';

import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  formatter?: (n: number) => string;
}

export function AnimatedCounter({
  target,
  duration,
  formatter = (n) => n.toLocaleString(),
}: AnimatedCounterProps) {
  const reduced = useReducedMotion();
  const current = useAnimatedCounter(target, duration, !reduced);

  return <span className="font-mono">{formatter(current)}</span>;
}
