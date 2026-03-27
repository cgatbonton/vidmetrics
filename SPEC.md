# VidMetrics — Product Spec

## Overview

A single-page web app where users paste a YouTube URL and instantly see performance analytics. Clean, minimal interface with motion-driven reveals using Framer Motion.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **motion/react** (formerly Framer Motion) — animations, transitions, infinite slider
- **hls.js** — HLS video streaming for hero background video
- **react-use-measure** — element sizing logic
- **clsx + tailwind-merge** — class management
- **lucide-react** — standard icons (custom SVG paths for specific UI elements)
- YouTube Data API v3 — fetch video statistics and metadata
- Auth — lightweight (NextAuth or custom) for save/dashboard flow
- Database — store saved analyses per user (Prisma + SQLite/Postgres)

---

## Pages & Flows

### 1. Landing Page (`/`)

High-end dark-mode glassmorphism aesthetic. URL input + analytics live on this page.

- On submit → fetch analytics → reveal metrics section below with staggered motion

#### Design System

| Token | Value |
|-------|-------|
| Background | `#010101` (near-black) |
| Primary gradient | `from-[#FA93FA] via-[#C967E8] to-[#983AD6]` (diagonal) |
| Typography | Modern sans-serif, center-aligned hero text |
| Glass surfaces | Semi-transparent dark backgrounds + `backdrop-blur` + subtle white/5 borders |

#### Hero Section

**Announcement Pill** (top badge)
- Pill-shaped, `bg-[rgba(28,27,36,0.15)]` with subtle border
- "Zap" icon inside a gradient-filled box with glow effect
- Text: "Used by founders. Loved by devs." in light grey

**Headline (H1)**
- Responsive: 48px mobile → 80px desktop
- Line 1: "Your Vision" / Line 2: "Our Digital Reality."
- Gradient text fill: white → purple/pink

**Subheadline**
- "We turn bold ideas into modern designs that don't just look amazing, they grow your business fast."
- Color: `text-white/80`

**CTA Button**
- "Book a 15-min call" — rounded-full, white bg, black text
- Circle icon with arrow, styled with the primary purple gradient
- Outer border wrapper with glass effect

**URL Input Bar**
- Positioned below CTA or integrated into hero flow
- Single input + "Analyze" button
- Glass-styled input field consistent with overall aesthetic

#### Hero Video Background

- **Source**: HLS stream via `hls.js` — `https://customer-cbeadsgr09pnsezs.cloudflarestream.com/697945ca6b876878dba3b23fbd2f1561/manifest/video.m3u8`
- **Fallback**: MP4 at `/_videos/v1/f0c78f536d5f21a047fb7792723a36f9d647daa1`
- **Implementation**: Native `<video>` tag + custom `useEffect` hook with `hls.js` (NOT react-player)
- **Styling**:
  - `mix-blend-screen` so black background blends into the page
  - Bottom of hero, `-mt-[150px]` to overlap behind text
  - Text content: `z-20` (above), video: `z-10` (below)
  - `w-full`, auto height, edge-to-edge (no `object-contain` or fixed heights)
  - Gradient overlay: `from-[#010101] via-transparent to-[#010101]`

#### Logo Cloud (below video)

- `bg-black/20 backdrop-blur-sm` with `border-white/5` top border
- **Desktop**: "Powering the best teams" left + vertical divider + animated logo slider right
- **Mobile**: Stacked vertically
- **Animation**: `InfiniteSlider` component (motion/react) — horizontal infinite scroll
- **Logos**: OpenAI, Nvidia, GitHub, etc. from `html.tailus.io/blocks/customers/` — apply `brightness-0 invert` for white treatment
- Logo SVG URLs:
  - `https://html.tailus.io/blocks/customers/openai.svg`
  - `https://html.tailus.io/blocks/customers/nvidia.svg`
  - (and similar)

#### Component Structure

```
src/
  components/
    landing/
      Hero.tsx              — full hero section (pill, headline, CTA, video, URL input)
      InfiniteSlider.tsx    — reusable infinite scroll component (motion/react)
      LogoCloud.tsx         — logo cloud section
    ui/
      ...shared UI primitives
```

### 2. Analytics Section (inline, below input)

Appears after analysis with a smooth slide-down + fade-in (framer-motion).

#### Metrics to Display

| Category | Metric | Source | Why It Matters |
|----------|--------|--------|----------------|
| **Reach** | View count | API `statistics.viewCount` | Core popularity signal |
| **Reach** | Subscriber count (channel) | API `statistics.subscriberCount` | Context for view performance |
| **Engagement** | Like count | API `statistics.likeCount` | Audience sentiment |
| **Engagement** | Comment count | API `statistics.commentCount` | Discussion depth |
| **Engagement** | Like-to-view ratio | Computed | Quality of engagement relative to reach |
| **Engagement** | Comment-to-view ratio | Computed | How much the video sparks conversation |
| **Content** | Duration | API `contentDetails.duration` | Content format context |
| **Content** | Published date | API `snippet.publishedAt` | Recency / age context |
| **Performance** | Views per day (avg) | Computed (views ÷ days since publish) | Sustained traction indicator |
| **Channel** | Total channel videos | API `statistics.videoCount` | Creator prolificness context |

#### Layout

- **Top row**: 3–4 primary metric cards (views, likes, comments, duration)
- **Bottom row**: 2–3 derived/ratio cards (like ratio, comment ratio, views/day)
- **Channel context**: Small card or badge showing channel name, subscriber count, total videos
- Video thumbnail displayed as a visual anchor

#### Motion

- Cards stagger in with `framer-motion` variants (fade-up, 50ms delay between each)
- Numbers count up from 0 using animated counters
- Ratio metrics render as small radial or bar micro-charts

### 3. Save Flow

- **"Save Analytics" button** appears below metrics
- If not logged in → prompt to create account (modal or inline form)
- If logged in → save instantly with toast confirmation

### 4. Dashboard (`/dashboard`) — Authenticated

- Grid of video tiles for all saved analyses
- Each tile shows:
  - Video thumbnail (from `snippet.thumbnails`)
  - Video title
  - Date analyzed
- **Click tile → modal** expands with the full analytics view (same layout as inline analytics)
- Modal uses framer-motion `layoutId` for smooth expand/collapse transitions

---

## Auth Flow

1. User clicks "Save Analytics" → modal with email/password sign-up (or OAuth)
2. After account creation → auto-save the current analysis
3. Subsequent visits: login → dashboard with saved videos
4. Navbar shows login/signup when anonymous, avatar/logout when authenticated

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/analyze` | POST | Accept YouTube URL, fetch & return metrics |
| `/api/auth/*` | — | Auth endpoints (NextAuth or custom) |
| `/api/saves` | GET | List user's saved analyses |
| `/api/saves` | POST | Save an analysis for the authenticated user |
| `/api/saves/[id]` | GET | Fetch a single saved analysis |

---

## Data Model

### `User`
- id, email, passwordHash, createdAt

### `SavedAnalysis`
- id, userId, videoId, videoTitle, thumbnailUrl, channelName, metrics (JSON), analyzedAt

---

## Design Principles

- **Minimal** — one input, one action, immediate results
- **Motion with purpose** — animations guide attention, not distract
- **No clutter** — every metric earns its place; derived ratios provide insight raw numbers don't
- **Mobile-first** — cards stack vertically on small screens
