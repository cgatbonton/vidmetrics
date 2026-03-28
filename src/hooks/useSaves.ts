'use client';

import { useState, useCallback } from 'react';
import type { SavedAnalysis, VideoAnalysis } from '@/types/analysis';
import type { StructuredError, SaveResult } from '@/types/api';

interface UseSavesReturn {
  saves: SavedAnalysis[];
  isLoading: boolean;
  error: string | null;
  fetchSaves: () => Promise<void>;
  saveAnalysis: (analysis: VideoAnalysis) => Promise<SaveResult<SavedAnalysis>>;
}

export function useSaves(): UseSavesReturn {
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

  const saveAnalysis = useCallback(async (analysis: VideoAnalysis): Promise<SaveResult<SavedAnalysis>> => {
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
    if (!res.ok) {
      return { entity: null, error: data.error as StructuredError, nextActions: [] };
    }
    return { entity: data.entity, error: null, nextActions: data.nextActions ?? [] };
  }, []);

  return { saves, isLoading, error, fetchSaves, saveAnalysis };
}
