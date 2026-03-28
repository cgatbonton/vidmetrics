'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCompact } from '@/lib/utils';
import type { MetricSnapshot } from '@/types/analysis';

interface ViewsOverTimeChartProps {
  snapshots: MetricSnapshot[];
  publishedAt: string;
  currentViews: number;
  onDateRangeChange: (from: string, to: string) => void;
}

interface DataPoint {
  date: Date;
  views: number;
  label: string;
}

const CHART_WIDTH = 800;
const CHART_HEIGHT = 300;
const PADDING = { top: 30, right: 30, bottom: 50, left: 70 } as const;
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;
const DATE_INPUT_CLASS =
  'bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[rgba(201,103,232,0.4)] focus:ring-1 focus:ring-[rgba(201,103,232,0.2)] focus:outline-none [color-scheme:dark] min-h-[44px]';

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function generateTicks(min: number, max: number, count: number): number[] {
  if (max === min) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(min + step * i));
}

export function ViewsOverTimeChart({
  snapshots,
  publishedAt,
  currentViews,
  onDateRangeChange,
}: ViewsOverTimeChartProps) {
  const reduced = useReducedMotion();

  const publishDate = useMemo(() => new Date(publishedAt), [publishedAt]);
  const today = useMemo(() => new Date(), []);

  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const defaultFrom = thirtyDaysAgo > publishDate ? thirtyDaysAgo : publishDate;
    return formatDateInput(defaultFrom);
  });
  const [toDate, setToDate] = useState(() => formatDateInput(today));

  const dataPoints: DataPoint[] = useMemo(() => {
    const points: DataPoint[] = [];

    // Origin: publish date with 0 views
    points.push({
      date: publishDate,
      views: 0,
      label: 'Published',
    });

    // Snapshots from the database
    for (const s of snapshots) {
      points.push({
        date: new Date(s.recordedAt),
        views: s.viewCount,
        label: formatDateShort(new Date(s.recordedAt)),
      });
    }

    // If no snapshots, add the current state as a point
    if (snapshots.length === 0) {
      points.push({
        date: today,
        views: currentViews,
        label: 'Now',
      });
    }

    // Sort by date
    points.sort((a, b) => a.date.getTime() - b.date.getTime());

    return points;
  }, [snapshots, publishDate, currentViews, today]);

  // Scale calculations
  const { xScale, yScale, yTicks, xTicks } = useMemo(() => {
    const dates = dataPoints.map((p) => p.date.getTime());
    const views = dataPoints.map((p) => p.views);
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const maxViews = Math.max(...views, 1);

    const xRange = maxDate - minDate || 1;
    const yPadded = maxViews * 1.1;

    const xScaleFn = (date: Date) =>
      PADDING.left + ((date.getTime() - minDate) / xRange) * PLOT_WIDTH;
    const yScaleFn = (v: number) =>
      PADDING.top + PLOT_HEIGHT - (v / yPadded) * PLOT_HEIGHT;

    const yTickValues = generateTicks(0, maxViews, 5);
    const xTickCount = Math.min(dataPoints.length, 6);
    const xTickValues = generateTicks(0, dataPoints.length - 1, xTickCount).map(
      (i) => dataPoints[i]
    );

    return {
      xScale: xScaleFn,
      yScale: yScaleFn,
      yTicks: yTickValues,
      xTicks: xTickValues,
    };
  }, [dataPoints]);

  // Build the SVG path
  const linePath = useMemo(() => {
    if (dataPoints.length < 2) return '';
    return dataPoints
      .map((p, i) => {
        const x = xScale(p.date);
        const y = yScale(p.views);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }, [dataPoints, xScale, yScale]);

  // Area path (for gradient fill)
  const areaPath = useMemo(() => {
    if (dataPoints.length < 2) return '';
    const baseline = PADDING.top + PLOT_HEIGHT;
    const first = dataPoints[0];
    const last = dataPoints[dataPoints.length - 1];
    return `${linePath} L${xScale(last.date)},${baseline} L${xScale(first.date)},${baseline} Z`;
  }, [dataPoints, linePath, xScale]);

  function handleDateChange(field: 'from' | 'to', value: string): void {
    if (field === 'from') {
      setFromDate(value);
      onDateRangeChange(value, toDate);
    } else {
      setToDate(value);
      onDateRangeChange(fromDate, value);
    }
  }

  const containerProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.5,
          delay: 0.1,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      };

  return (
    <motion.div {...containerProps}>
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Views Over Time
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <label className="flex items-center gap-2">
              <span className="text-[11px] text-white/40">From</span>
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className={DATE_INPUT_CLASS}
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-[11px] text-white/40">To</span>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className={DATE_INPUT_CLASS}
              />
            </label>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full"
            role="img"
            aria-label="Line chart showing video views over time"
          >
            <defs>
              <linearGradient id="views-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FA93FA" />
                <stop offset="100%" stopColor="#983AD6" />
              </linearGradient>
              <linearGradient id="views-area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(201,103,232,0.15)" />
                <stop offset="100%" stopColor="rgba(201,103,232,0)" />
              </linearGradient>
            </defs>

            {/* Y-axis grid lines */}
            {yTicks.map((tick) => {
              const y = yScale(tick);
              return (
                <g key={`y-${tick}`}>
                  <line
                    x1={PADDING.left}
                    y1={y}
                    x2={PADDING.left + PLOT_WIDTH}
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                  <text
                    x={PADDING.left - 12}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="central"
                    fill="rgba(255,255,255,0.35)"
                    fontSize="11"
                    fontFamily="var(--font-geist-mono)"
                  >
                    {formatCompact(tick)}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {xTicks.map((point) => {
              if (!point) return null;
              const x = xScale(point.date);
              return (
                <text
                  key={`x-${point.date.getTime()}`}
                  x={x}
                  y={PADDING.top + PLOT_HEIGHT + 24}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.35)"
                  fontSize="11"
                  fontFamily="var(--font-geist-sans)"
                >
                  {formatDateShort(point.date)}
                </text>
              );
            })}

            {/* Area fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#views-area-gradient)"
              />
            )}

            {/* Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#views-line-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points */}
            {dataPoints.map((point, i) => {
              const x = xScale(point.date);
              const y = yScale(point.views);
              return (
                <g key={i}>
                  {/* Larger invisible hit area */}
                  <circle
                    cx={x}
                    cy={y}
                    r={16}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setHoveredPoint(prev => prev === i ? null : i);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={hoveredPoint === i ? 6 : 4}
                    fill={hoveredPoint === i ? '#FA93FA' : 'url(#views-line-gradient)'}
                    style={{ transition: 'r 0.15s ease' }}
                  />

                  {/* Hover tooltip */}
                  {hoveredPoint === i && (
                    <g>
                      {/* Vertical reference line */}
                      <line
                        x1={x}
                        y1={PADDING.top}
                        x2={x}
                        y2={PADDING.top + PLOT_HEIGHT}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      {/* Tooltip background */}
                      <rect
                        x={x - 55}
                        y={y - 44}
                        width={110}
                        height={34}
                        rx={8}
                        fill="rgba(10,10,10,0.95)"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={y - 32}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="700"
                        fontFamily="var(--font-geist-mono)"
                      >
                        {formatCompact(point.views)} views
                      </text>
                      <text
                        x={x}
                        y={y - 18}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.5)"
                        fontSize="10"
                        fontFamily="var(--font-geist-sans)"
                      >
                        {point.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </GlassCard>
    </motion.div>
  );
}
