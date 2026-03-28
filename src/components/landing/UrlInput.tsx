'use client';

import { useState, useRef, type FormEvent, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAnalyze } from '@/hooks/useAnalyze';
import type { ChannelAnalysis } from '@/types/analysis';

interface UrlInputProps {
  onAnalyze: (data: ChannelAnalysis) => void;
}

export function UrlInput({ onAnalyze }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const { data, error, isLoading, analyze } = useAnalyze();
  const onAnalyzeRef = useRef(onAnalyze);
  onAnalyzeRef.current = onAnalyze;

  useEffect(() => {
    if (data) {
      onAnalyzeRef.current(data);
    }
  }, [data]);

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    analyze(url.trim());
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a YouTube channel URL..."
          className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 w-full focus:border-[rgba(201,103,232,0.4)] focus:ring-1 focus:ring-[rgba(201,103,232,0.2)] focus:outline-none transition-colors"
        />
        <Button
          type="submit"
          variant="gradient"
          loading={isLoading}
          className="shrink-0"
        >
          <Search className="w-4 h-4" />
          Analyze
        </Button>
      </div>
      {isLoading && (
        <p className="text-sm text-white/40 mt-2">
          This may take up to 30 seconds while we fetch and analyze the channel&apos;s videos.
        </p>
      )}
      {error && (
        <p className="text-sm text-[var(--vm-error)] mt-2">{error}</p>
      )}
    </form>
  );
}
