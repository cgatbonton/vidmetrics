# VidMetrics

YouTube channel analytics tool. Paste a channel URL to get scored video performance metrics (VMS scores), content type breakdowns, and AI-powered strategy analysis. Save channel analyses to your account for later reference.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Tailwind CSS 4
- **Animation**: motion/react (Framer Motion)
- **AI**: OpenAI (o4-mini for content analysis)
- **Icons**: lucide-react

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [YouTube Data API](https://console.cloud.google.com) key
- An [OpenAI](https://platform.openai.com) API key

### Setup

```bash
git clone <repo-url>
cd vidmetrics
npm install
```

Create a `.env.local` file:

```env
YOUTUBE_API_KEY=your_youtube_api_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional — rate limiting (fails open without these)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### Database

Run the SQL migrations in order in your Supabase SQL Editor:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_saved_channels.sql
supabase/migrations/003_pending_saves.sql
supabase/migrations/004_video_ai_analyses.sql
```

### Run

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # Type check
```

## Project Structure

```
src/
├── app/                    # Pages & API routes
│   ├── api/
│   │   ├── analyze/        # Channel/video analysis
│   │   ├── video-analysis/ # Per-video AI analysis
│   │   ├── saved-channels/ # Saved channel analyses
│   │   ├── saves/          # Saved video analyses
│   │   └── ...             # Auth routes (register, login, logout)
│   ├── dashboard/          # Authenticated dashboard
│   └── settings/           # User settings
├── components/
│   ├── channel/            # VideoGrid, VideoTile, VideoDetailModal
│   ├── charts/             # EngagementRadar, ViewsOverTimeChart
│   ├── dashboard/          # SavedAnalysisTile, AnalyticsModal
│   ├── landing/            # Hero, UrlInput, AnalyticsSection
│   └── ui/                 # Button, Modal, Toast, GlassCard
├── hooks/                  # useAnalyze, useSavedChannels, useVideoAiAnalysis
├── lib/                    # Core logic (metrics, youtube, ai, auth, supabase)
└── types/                  # TypeScript interfaces
```

## Features

- **Channel Analysis** — Fetch and score recent videos from any YouTube channel
- **VMS Scoring** — Proprietary Video Metrics Score combining engagement, velocity, and reach
- **Content Type Breakdown** — Automatic classification of video content types with performance comparison
- **AI Strategy Analysis** — Channel-level and per-video competitive intelligence powered by OpenAI
- **Save & Track** — Authenticated users can save analyses and revisit them later
- **Engagement Radar** — Visual radar chart comparing engagement dimensions

## License

Private
