'use client';

import { useState, useRef, type FormEvent, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAnalyze } from '@/hooks/useAnalyze';
import type { ChannelAnalysis } from '@/types/analysis';

interface UrlInputProps {
  onAnalyze: (data: ChannelAnalysis, constraints: { canSave: boolean }) => void;
}

export function UrlInput({ onAnalyze }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const { data, constraints, error, isLoading, analyze } = useAnalyze();
  const onAnalyzeRef = useRef(onAnalyze);
  useEffect(() => { onAnalyzeRef.current = onAnalyze; });

  useEffect(() => {
    if (data && constraints) {
      onAnalyzeRef.current(data, constraints);
    }
  }, [data, constraints]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    analyze(url.trim());
  };

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
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Analyze
          </span>
        </Button>
      </div>
      {error && (
        <p className="text-sm text-[var(--vm-error)] mt-2">{error}</p>
      )}
    </form>
  );
}
