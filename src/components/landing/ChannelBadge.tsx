import { formatCompact } from '@/lib/utils';

interface ChannelBadgeProps {
  name: string;
  subscribers: number;
  videoCount: number;
}

export function ChannelBadge({ name, subscribers, videoCount }: ChannelBadgeProps) {
  return (
    <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-full px-4 py-2">
      <span className="text-sm font-medium text-white">{name}</span>
      <span className="w-1 h-1 rounded-full bg-white/30" />
      <span className="text-sm text-white/60">
        {formatCompact(subscribers)} subscribers
      </span>
      <span className="w-1 h-1 rounded-full bg-white/30" />
      <span className="text-sm text-white/60">{videoCount} videos</span>
    </div>
  );
}
