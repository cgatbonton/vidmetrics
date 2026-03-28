'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface MetricCardProps {
  label: string;
  value: number;
  formatter?: (n: number) => string;
  icon?: React.ReactNode;
  index?: number;
}

export function MetricCard({
  label,
  value,
  formatter,
  icon,
  index = 0,
}: MetricCardProps) {
  const reduced = useReducedMotion();

  const motionProps = reduced
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.5,
          delay: index * 0.05,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      };

  return (
    <motion.div {...motionProps}>
      <GlassCard hoverable className="p-4 sm:p-6 relative">
        {icon && (
          <div className="absolute top-4 right-4 bg-gradient-to-br from-[#FA93FA] to-[#983AD6] rounded-md p-1.5">
            {icon}
          </div>
        )}
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
          {label}
        </p>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-2">
          <AnimatedCounter target={value} formatter={formatter} />
        </div>
      </GlassCard>
    </motion.div>
  );
}
