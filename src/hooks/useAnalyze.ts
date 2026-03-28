'use client';

import { useState, useCallback } from 'react';
import type { ChannelAnalysis, AnalysisConstraints } from '@/types/analysis';

interface UseAnalyzeReturn {
  data: ChannelAnalysis | null;
  constraints: AnalysisConstraints | null;
  nextActions: string[];
  error: string | null;
  isLoading: boolean;
  analyze: (url: string) => Promise<void>;
  reset: () => void;
}

export function useAnalyze(): UseAnalyzeReturn {
  const [data, setData] = useState<ChannelAnalysis | null>(null);
  const [constraints, setConstraints] = useState<AnalysisConstraints | null>(null);
  const [nextActions, setNextActions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function clearState(): void {
    setData(null);
    setConstraints(null);
    setNextActions([]);
    setError(null);
  }

  const analyze = useCallback(async (url: string) => {
    setIsLoading(true);
    clearState();

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
          setNextActions(json.nextActions ?? []);
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

  const reset = useCallback(clearState, []);

  return { data, constraints, nextActions, error, isLoading, analyze, reset };
}
