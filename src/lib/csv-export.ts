import type { LabeledVideo } from '@/types/analysis';

const CSV_COLUMNS = [
  'Title',
  'Content Type',
  'VMS Score',
  'Views',
  'Likes',
  'Comments',
  'Views/Day',
  'Engagement Rate',
  'Duration',
  'Published Date',
] as const;

function escapeField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatPublishedDate(iso: string): string {
  const date = new Date(iso);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function videoToRow(video: LabeledVideo): string {
  const engagementPercent = (video.engagementRate * 100).toFixed(2);

  const fields = [
    escapeField(video.title),
    escapeField(video.contentType),
    String(video.vmsScore),
    String(video.viewCount),
    String(video.likeCount),
    String(video.commentCount),
    String(Math.round(video.viewsPerDay)),
    `${engagementPercent}%`,
    video.duration,
    formatPublishedDate(video.publishedAt),
  ];

  return fields.join(',');
}

export function buildCsvString(videos: LabeledVideo[]): string {
  const header = CSV_COLUMNS.join(',');
  const rows = videos.map(videoToRow);
  return [header, ...rows].join('\n');
}

export function downloadCsv(videos: LabeledVideo[], filename: string): void {
  const csv = buildCsvString(videos);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
