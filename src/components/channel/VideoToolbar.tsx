'use client';

import { Search, SlidersHorizontal, ArrowUpDown, X, Calendar } from 'lucide-react';
import type { VmsScoreTier } from '@/types/analysis';

export type DatePreset = '7d' | '30d' | '90d' | 'all';

export const DATE_PRESET_DAYS: Record<DatePreset, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  'all': null,
};

const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'all', label: 'All' },
];

const TIER_OPTIONS: { value: VmsScoreTier; label: string }[] = [
  { value: 'viral', label: 'Viral (90+)' },
  { value: 'hot', label: 'Hot (70–89)' },
  { value: 'average', label: 'Average (40–69)' },
  { value: 'underperforming', label: 'Under (0–39)' },
];

export type SortField =
  | 'vmsScore'
  | 'viewCount'
  | 'likeCount'
  | 'commentCount'
  | 'publishedAt'
  | 'engagementRate';

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'vmsScore', label: 'VMS Score' },
  { value: 'viewCount', label: 'Views' },
  { value: 'likeCount', label: 'Likes' },
  { value: 'commentCount', label: 'Comments' },
  { value: 'publishedAt', label: 'Date Published' },
  { value: 'engagementRate', label: 'Engagement Rate' },
];

interface VideoToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  tierFilter: VmsScoreTier | null;
  onTierFilterChange: (value: VmsScoreTier | null) => void;
  contentTypeFilter: string | null;
  onContentTypeFilterChange: (value: string | null) => void;
  contentTypes: string[];
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  datePreset: DatePreset;
  onDatePresetChange: (value: DatePreset) => void;
  resultCount: number;
  totalCount: number;
}

const selectClasses =
  'appearance-none bg-white/[0.05] border border-white/10 rounded-lg py-2 pr-8 text-sm text-white/80 hover:bg-white/[0.08] hover:border-white/15 focus:border-[rgba(201,103,232,0.4)] focus:ring-1 focus:ring-[rgba(201,103,232,0.2)] focus:outline-none transition-colors cursor-pointer';

const iconSelectClasses = `${selectClasses} pl-8`;

export function VideoToolbar({
  search,
  onSearchChange,
  tierFilter,
  onTierFilterChange,
  contentTypeFilter,
  onContentTypeFilterChange,
  contentTypes,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
  datePreset,
  onDatePresetChange,
  resultCount,
  totalCount,
}: VideoToolbarProps) {
  const hasActiveFilters =
    search.length > 0 || tierFilter !== null || contentTypeFilter !== null || datePreset !== 'all';

  const sortKey = `${sortField}-${sortDirection}`;

  function handleSortChange(value: string) {
    const lastDash = value.lastIndexOf('-');
    onSortFieldChange(value.slice(0, lastDash) as SortField);
    onSortDirectionChange(value.slice(lastDash + 1) as 'asc' | 'desc');
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search videos..."
            className="w-full bg-white/[0.05] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-[rgba(201,103,232,0.4)] focus:ring-1 focus:ring-[rgba(201,103,232,0.2)] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <select
              value={tierFilter ?? ''}
              onChange={(e) =>
                onTierFilterChange(
                  e.target.value ? (e.target.value as VmsScoreTier) : null
                )
              }
              className={iconSelectClasses}
            >
              <option value="">All Scores</option>
              {TIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {contentTypes.length > 0 && (
            <div className="relative">
              <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              <select
                value={contentTypeFilter ?? ''}
                onChange={(e) =>
                  onContentTypeFilterChange(e.target.value || null)
                }
                className={iconSelectClasses}
              >
                <option value="">All Types</option>
                {contentTypes.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <select
              value={sortKey}
              onChange={(e) => handleSortChange(e.target.value)}
              className={iconSelectClasses}
            >
              {SORT_OPTIONS.map((opt) => (
                <optgroup key={opt.value} label={opt.label}>
                  <option value={`${opt.value}-desc`}>
                    {opt.label} ↓ High to Low
                  </option>
                  <option value={`${opt.value}-asc`}>
                    {opt.label} ↑ Low to High
                  </option>
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-white/40">
          <Calendar className="w-3.5 h-3.5" />
          Period:
        </span>
        {DATE_PRESET_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onDatePresetChange(opt.value)}
            className={`border rounded-full px-3 py-1 text-xs transition-colors cursor-pointer ${
              datePreset === opt.value
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-white/[0.03] text-white/40 border-white/5 hover:bg-white/[0.06] hover:text-white/60'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span>
            Showing {resultCount} of {totalCount} videos
          </span>
          <button
            onClick={() => {
              onSearchChange('');
              onTierFilterChange(null);
              onContentTypeFilterChange(null);
              onDatePresetChange('all');
            }}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
