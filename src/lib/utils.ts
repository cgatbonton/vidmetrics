import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

export function formatMultiplier(n: number): string {
  return `${n.toFixed(1)}x`;
}

export function formatScore(n: number): string {
  return `${Math.round(n)}/100`;
}

const ISO_8601_DURATION = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;

function parseIsoParts(iso: string): { hours: number; minutes: number; seconds: number } | null {
  const match = iso.match(ISO_8601_DURATION);
  if (!match) return null;
  return {
    hours: parseInt(match[1] || "0", 10),
    minutes: parseInt(match[2] || "0", 10),
    seconds: parseInt(match[3] || "0", 10),
  };
}

export function formatDuration(iso: string): string {
  const parts = parseIsoParts(iso);
  if (!parts) return iso;
  const { hours, minutes, seconds } = parts;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function parseDurationToSeconds(iso: string): number {
  const parts = parseIsoParts(iso);
  if (!parts) return 0;
  return parts.hours * 3600 + parts.minutes * 60 + parts.seconds;
}

const YOUTUBE_URL_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
];

export function extractVideoId(url: string): string | null {
  const trimmed = url.trim();
  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export type ChannelIdentifier = {
  type: "handle" | "id" | "custom";
  value: string;
};

const CHANNEL_URL_PATTERNS: {
  pattern: RegExp;
  type: ChannelIdentifier["type"];
}[] = [
  { pattern: /youtube\.com\/@([a-zA-Z0-9_.-]+)/, type: "handle" },
  { pattern: /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/, type: "id" },
  { pattern: /youtube\.com\/c\/([a-zA-Z0-9_.-]+)/, type: "custom" },
];

export function extractChannelIdentifier(
  url: string
): ChannelIdentifier | null {
  const trimmed = url.trim();
  for (const { pattern, type } of CHANNEL_URL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (!match) continue;
    const value = type === "handle" ? `@${match[1]}` : match[1];
    return { type, value };
  }
  return null;
}
