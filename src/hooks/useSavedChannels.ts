'use client';

import { useState, useCallback } from 'react';
import type { ChannelAnalysis, SavedChannel } from '@/types/analysis';
import type { StructuredError, SaveResult } from '@/types/api';

interface UseSavedChannelsReturn {
  saves: SavedChannel[];
  isLoading: boolean;
  error: string | null;
  fetchSaves: () => Promise<void>;
  saveChannel: (analysis: ChannelAnalysis) => Promise<SaveResult<SavedChannel>>;
  deleteChannel: (id: string) => Promise<{ error: StructuredError | null }>;
}

export function useSavedChannels(): UseSavedChannelsReturn {
  const [saves, setSaves] = useState<SavedChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSaves = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/saved-channels');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.reason || 'Failed to fetch');
        return;
      }
      setSaves(data.entity);
    } catch {
      setError('Failed to fetch saved channels');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveChannel = useCallback(async (analysis: ChannelAnalysis): Promise<SaveResult<SavedChannel>> => {
    const res = await fetch('/api/saved-channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelId: analysis.channel.channelId,
        channelName: analysis.channel.channelName,
        channelAvatar: analysis.channel.channelAvatar,
        subscriberCount: analysis.channel.subscriberCount,
        videoCount: analysis.channel.videoCount,
        videos: analysis.videos,
        contentTypes: analysis.contentTypes,
        aiAnalysis: analysis.aiAnalysis,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { entity: null, error: data.error as StructuredError, nextActions: [] };
    }
    return { entity: data.entity, error: null, nextActions: data.nextActions ?? [] };
  }, []);

  const deleteChannel = useCallback(async (id: string): Promise<{ error: StructuredError | null }> => {
    const res = await fetch(`/api/saved-channels/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error as StructuredError };
    }
    setSaves(prev => prev.filter(s => s.id !== id));
    return { error: null };
  }, []);

  return { saves, isLoading, error, fetchSaves, saveChannel, deleteChannel };
}
