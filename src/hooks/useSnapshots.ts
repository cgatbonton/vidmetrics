'use client';

import { useState, useCallback, useRef } from 'react';
import type { MetricSnapshot } from '@/types/analysis';

interface UseSnapshotsReturn {
  snapshots: MetricSnapshot[];
  isLoading: boolean;
  error: string | null;
  fetchSnapshots: (videoId: string, from?: string, to?: string) => Promise<void>;
}

export function useSnapshots(): UseSnapshotsReturn {
  const [snapshots, setSnapshots] = useState<MetricSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackRef = useRef<((s: MetricSnapshot[]) => void) | null>(null);

  const fetchSnapshots = useCallback(async (videoId: string, from?: string, to?: string) => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ videoId });
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    try {
      const res = await fetch(`/api/snapshots?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.reason || 'Failed to fetch snapshots');
        return;
      }
      setSnapshots(data.entity);
      callbackRef.current?.(data.entity);
    } catch {
      setError('Failed to fetch snapshots');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { snapshots, isLoading, error, fetchSnapshots };
}
