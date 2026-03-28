'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Info, ChevronDown, Bookmark, Download } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { VideoTile } from '@/components/channel/VideoTile';
import { VideoToolbar } from '@/components/channel/VideoToolbar';
import { ScoreLegendModal } from '@/components/channel/ScoreLegendModal';
import { downloadCsv } from '@/lib/csv-export';
import { DATE_PRESET_DAYS } from '@/components/channel/VideoToolbar';
import type { SortField, DatePreset } from '@/components/channel/VideoToolbar';
import type { ScoredVideo, LabeledVideo, VmsScoreTier } from '@/types/analysis';

const PAGE_SIZE = 25;

const glassButtonClasses =
  'flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.08] transition-colors cursor-pointer';

interface VideoGridProps {
  videos: LabeledVideo[];
  onVideoClick: (video: ScoredVideo) => void;
  onSave?: () => void;
}

export function VideoGrid({ videos, onVideoClick, onSave }: VideoGridProps) {
  const [legendOpen, setLegendOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const reduced = useReducedMotion();

  // Toolbar state
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<VmsScoreTier | null>(null);
  const [contentTypeFilter, setContentTypeFilter] = useState<string | null>(
    null
  );
  const [sortField, setSortField] = useState<SortField>('vmsScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');

  // Reset pagination when any filter changes
  const resetPage = () => setVisibleCount(PAGE_SIZE);
  const handleSearch = (v: string) => { setSearch(v); resetPage(); };
  const handleTierFilter = (v: VmsScoreTier | null) => { setTierFilter(v); resetPage(); };
  const handleContentTypeFilter = (v: string | null) => { setContentTypeFilter(v); resetPage(); };
  const handleDatePreset = (v: DatePreset) => { setDatePreset(v); resetPage(); };

  const contentTypes = useMemo(() => {
    const types = new Set<string>();
    for (const v of videos) {
      if (v.contentType) types.add(v.contentType);
    }
    return Array.from(types).sort();
  }, [videos]);

  const filteredAndSorted = useMemo(() => {
    let result = videos;

    // Date preset filter
    const days = DATE_PRESET_DAYS[datePreset];
    if (days !== null) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffTime = cutoff.getTime();
      result = result.filter(
        (v) => new Date(v.publishedAt).getTime() >= cutoffTime
      );
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((v) => v.title.toLowerCase().includes(q));
    }

    // Tier filter
    if (tierFilter) {
      result = result.filter((v) => v.vmsTier === tierFilter);
    }

    // Content type filter
    if (contentTypeFilter) {
      result = result.filter((v) => v.contentType === contentTypeFilter);
    }

    // Sort
    const sorted = [...result].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortField === 'publishedAt') {
        aVal = new Date(a.publishedAt).getTime();
        bVal = new Date(b.publishedAt).getTime();
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }

      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return sorted;
  }, [videos, search, tierFilter, contentTypeFilter, sortField, sortDirection, datePreset]);

  const visibleVideos = filteredAndSorted.slice(0, visibleCount);
  const hasMore = filteredAndSorted.length > visibleCount;

  const containerProps = reduced
    ? {}
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
        variants: {
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        },
      };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Top {videos.length} Videos
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCsv(filteredAndSorted, 'vidmetrics-export.csv')}
            className={glassButtonClasses}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FA93FA] via-[#C967E8] to-[#983AD6] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_0_16px_rgba(201,103,232,0.35)] hover:shadow-[0_0_24px_rgba(201,103,232,0.5)] hover:brightness-110 transition-all cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Search
            </button>
          )}
          <button
            onClick={() => setLegendOpen(true)}
            className={glassButtonClasses}
          >
            <Info className="w-3.5 h-3.5" />
            How scoring works
          </button>
        </div>
      </div>

      <div className="mt-4">
        <VideoToolbar
          search={search}
          onSearchChange={handleSearch}
          tierFilter={tierFilter}
          onTierFilterChange={handleTierFilter}
          contentTypeFilter={contentTypeFilter}
          onContentTypeFilterChange={handleContentTypeFilter}
          contentTypes={contentTypes}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
          datePreset={datePreset}
          onDatePresetChange={handleDatePreset}
          resultCount={filteredAndSorted.length}
          totalCount={videos.length}
        />
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4"
        {...containerProps}
      >
        {visibleVideos.map((video) => (
          <VideoTile
            key={video.videoId}
            video={video}
            onClick={() => onVideoClick(video)}
          />
        ))}
      </motion.div>

      {visibleVideos.length === 0 && (
        <div className="text-center py-12 text-white/40 text-sm">
          No videos match your filters.
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full px-6 py-2.5 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
            Load more
          </button>
        </div>
      )}

      <ScoreLegendModal
        isOpen={legendOpen}
        onClose={() => setLegendOpen(false)}
      />
    </div>
  );
}
