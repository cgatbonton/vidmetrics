import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function GlassCard({
  children,
  className,
  hoverable = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-xl',
        hoverable && 'hover:bg-white/[0.06] hover:border-white/10 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
