'use client';

import { useState, useCallback } from 'react';
import type { ChannelAnalysis } from '@/types/analysis';

interface AnalysisConstraints {
  canSave: boolean;
}

interface UseAnalyzeReturn {
  data: ChannelAnalysis | null;
  constraints: AnalysisConstraints | null;
  error: string | null;
  isLoading: boolean;
  analyze: (url: string) => Promise<void>;
  reset: () => void;
}

export function useAnalyze(): UseAnalyzeReturn {
  const [data, setData] = useState<ChannelAnalysis | null>(null);
  const [constraints, setConstraints] = useState<AnalysisConstraints | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyze = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setConstraints(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const json = await response.json();

      if (response.ok) {
        const entity = json.entity;
        if (entity?.channel && entity?.videos) {
          setData(entity);
          setConstraints(json.constraints ?? { canSave: false });
        } else {
          setError('Please enter a YouTube channel URL (e.g. youtube.com/@channelname)');
        }
      } else {
        setError(json.error?.reason ?? 'Analysis failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setConstraints(null);
    setError(null);
  }, []);

  return { data, constraints, error, isLoading, analyze, reset };
}
