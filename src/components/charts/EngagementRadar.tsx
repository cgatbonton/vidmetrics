'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAnimatedRadar } from '@/hooks/useAnimatedRadar';
import { GlassCard } from '@/components/ui/GlassCard';
import type { RadarScores } from '@/types/analysis';

interface EngagementRadarProps {
  scores: RadarScores;
}

const AXES = [
  {
    key: 'engagement' as const,
    label: 'Engagement',
    description: 'Combined likes + comments relative to views. Scored on a log scale — top videos exceed 8%, bottom tier falls below 0.5%.',
  },
  {
    key: 'likeStrength' as const,
    label: 'Like Strength',
    description: 'Like-to-view ratio. Log-scaled from 0.3% (low) to 5%+ (exceptional). Measures how compelled viewers are to like.',
  },
  {
    key: 'discussion' as const,
    label: 'Discussion',
    description: 'Comment-to-view ratio. Log-scaled from 0.01% (low) to 1%+ (highly engaging). Indicates how much conversation the video sparks.',
  },
  {
    key: 'velocity' as const,
    label: 'Velocity',
    description: 'Views per day relative to subscriber count. Measures how fast the video is growing compared to the channel\'s audience size.',
  },
  {
    key: 'optimization' as const,
    label: 'Optimization',
    description: 'Content completeness score based on: tags present, video duration in optimal range (7–20 min), description length, and tag richness.',
  },
];

const SVG_SIZE = 400;
const CENTER = SVG_SIZE / 2;
const RADIUS = 130;
const GRID_LEVELS = [20, 40, 60, 80, 100];
const AXIS_COUNT = AXES.length;

function getPoint(axisIndex: number, value: number): { x: number; y: number } {
  const angle = (2 * Math.PI * axisIndex) / AXIS_COUNT - Math.PI / 2;
  const r = (value / 100) * RADIUS;
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  };
}

function polygonPoints(values: number[]): string {
  return values
    .map((v, i) => {
      const { x, y } = getPoint(i, v);
      return `${x},${y}`;
    })
    .join(' ');
}

function getAngle(axisIndex: number): number {
  return (2 * Math.PI * axisIndex) / AXIS_COUNT - Math.PI / 2;
}

export function EngagementRadar({ scores }: EngagementRadarProps) {
  const reduced = useReducedMotion();
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const targets = AXES.map((a) => scores[a.key]);
  const animated = useAnimatedRadar(targets, 1500, !reduced);

  const containerProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      };

  return (
    <motion.div {...containerProps}>
      <GlassCard className="p-6 sm:p-8">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">
          Performance Profile
        </p>
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm sm:max-w-md">
            {/* SVG radar chart */}
            <svg
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              className="w-full"
              role="img"
              aria-label="Engagement radar chart showing video performance across 5 dimensions"
            >
              <defs>
                <linearGradient
                  id="radar-stroke-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FA93FA" />
                  <stop offset="100%" stopColor="#983AD6" />
                </linearGradient>
                <linearGradient
                  id="radar-dot-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FA93FA" />
                  <stop offset="100%" stopColor="#983AD6" />
                </linearGradient>
              </defs>

              {/* Grid lines — concentric pentagons */}
              {GRID_LEVELS.map((level) => (
                <polygon
                  key={level}
                  points={polygonPoints(Array(AXIS_COUNT).fill(level))}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Axis lines from center to vertices */}
              {AXES.map((_, i) => {
                const { x, y } = getPoint(i, 100);
                return (
                  <line
                    key={i}
                    x1={CENTER}
                    y1={CENTER}
                    x2={x}
                    y2={y}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data polygon */}
              <polygon
                points={polygonPoints(animated)}
                fill="rgba(201,103,232,0.12)"
                stroke="url(#radar-stroke-gradient)"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Vertex dots */}
              {animated.map((value, i) => {
                const { x, y } = getPoint(i, value);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={4}
                    fill="url(#radar-dot-gradient)"
                  />
                );
              })}
            </svg>

            {/* HTML labels positioned over the SVG */}
            {AXES.map((axis, i) => {
              const angle = getAngle(i);
              const labelRadius = RADIUS + 36;
              const xPct = ((CENTER + labelRadius * Math.cos(angle)) / SVG_SIZE) * 100;
              const yPct = ((CENTER + labelRadius * Math.sin(angle)) / SVG_SIZE) * 100;

              // Determine alignment based on position around the circle
              const isTop = i === 0;
              const isRight = angle > -Math.PI / 2 && angle < Math.PI / 2;
              const isLeft = angle > Math.PI / 2 || angle < -Math.PI / 2;

              let translateX = '-50%';
              let textAlign: 'center' | 'left' | 'right' = 'center';
              if (!isTop && isRight) {
                translateX = '0%';
                textAlign = 'left';
              } else if (!isTop && isLeft) {
                translateX = '-100%';
                textAlign = 'right';
              }

              return (
                <div
                  key={axis.key}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    transform: `translate(${translateX}, -50%)`,
                    textAlign,
                  }}
                >
                  <div className="flex items-center gap-1 relative">
                    <span className="text-white/50 text-[11px] font-medium whitespace-nowrap">
                      {axis.label}
                    </span>
                    <button
                      className="text-white/30 hover:text-white/60 transition-colors cursor-help"
                      onMouseEnter={() => setActiveTooltip(i)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onFocus={() => setActiveTooltip(i)}
                      onBlur={() => setActiveTooltip(null)}
                      aria-label={`Info about ${axis.label}`}
                    >
                      <Info className="w-3 h-3" />
                    </button>

                    {/* Tooltip */}
                    <AnimatePresence>
                      {activeTooltip === i && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 w-52 p-3 rounded-lg bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-xl"
                          style={{
                            bottom: isTop ? undefined : '100%',
                            top: isTop ? '100%' : undefined,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginBottom: isTop ? undefined : '8px',
                            marginTop: isTop ? '8px' : undefined,
                          }}
                        >
                          <p className="text-white text-xs font-semibold mb-1">
                            {axis.label}
                            <span className="ml-1.5 font-mono text-[#C967E8]">
                              {scores[axis.key]}/100
                            </span>
                          </p>
                          <p className="text-white/50 text-[11px] leading-relaxed">
                            {axis.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-white font-bold font-mono text-sm">
                    {scores[axis.key]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
