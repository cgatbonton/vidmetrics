'use client';

import { useState, useCallback } from 'react';
import type { SavedAnalysis, VideoAnalysis } from '@/types/analysis';

export function useSaves() {
  const [saves, setSaves] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSaves = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/saves');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.reason || 'Failed to fetch');
        return;
      }
      setSaves(data.entity);
    } catch {
      setError('Failed to fetch saves');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAnalysis = useCallback(async (analysis: VideoAnalysis) => {
    const res = await fetch('/api/saves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: analysis.videoId,
        videoTitle: analysis.title,
        thumbnailUrl: analysis.thumbnailUrl,
        channelName: analysis.channelName,
        metrics: analysis,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.reason || 'Failed to save');
    return data.entity;
  }, []);

  return { saves, isLoading, error, fetchSaves, saveAnalysis };
}
