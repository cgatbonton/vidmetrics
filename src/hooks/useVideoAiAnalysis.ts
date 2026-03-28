'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ScoredVideo, VideoAiAnalysis } from '@/types/analysis';

interface UseVideoAiAnalysisReturn {
  analysis: VideoAiAnalysis | null;
  isLoading: boolean;
  isGenerating: boolean;
  isAuthenticated: boolean;
  error: string | null;
  generate: () => Promise<void>;
}

export function useVideoAiAnalysis(
  video: ScoredVideo | null,
  channelSubs: number
): UseVideoAiAnalysisReturn {
  const [analysis, setAnalysis] = useState<VideoAiAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef(video);
  videoRef.current = video;

  const channelSubsRef = useRef(channelSubs);
  channelSubsRef.current = channelSubs;

  const isGeneratingRef = useRef(false);

  const videoId = video?.videoId ?? null;

  useEffect(() => {
    if (!videoId) {
      setAnalysis(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchExisting() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/video-analysis?videoId=${encodeURIComponent(videoId!)}`);

        if (res.status === 401) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setAnalysis(null);
            setError(null);
          }
          return;
        }

        const data = await res.json();

        if (!cancelled) {
          setIsAuthenticated(true);
          if (res.ok && data.entity?.analysis) {
            setAnalysis(data.entity.analysis);
          } else if (res.ok) {
            setAnalysis(null);
          } else {
            setError(data.error?.reason || 'Failed to check for existing analysis');
          }
        }
      } catch {
        if (!cancelled) {
          setError('Failed to check for existing analysis');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchExisting();

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  const generate = useCallback(async () => {
    if (!videoRef.current || isGeneratingRef.current) return;

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/video-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video: videoRef.current,
          channelSubs: channelSubsRef.current,
        }),
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setAnalysis(data.entity?.analysis ?? null);
      } else {
        setError(data.error?.reason || 'Failed to generate analysis');
      }
    } catch {
      setError('Failed to generate analysis');
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  }, []);

  return { analysis, isLoading, isGenerating, isAuthenticated, error, generate };
}
