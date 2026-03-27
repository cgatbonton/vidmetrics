# VidMetrics — Brand Book

## 1. Brand Identity

| Attribute | Value |
|-----------|-------|
| **Name** | VidMetrics |
| **Product** | YouTube video performance analytics |
| **Aesthetic** | Dark glassmorphism — cinematic, motion-rich, premium |
| **Voice** | Clean, analytical, confident. Data speaks. |
| **Logo** | Wordmark "VidMetrics" in Geist Sans semibold, white on dark |

---

## 2. Color System

### CSS Custom Properties

Define these in `globals.css` on `:root`:

```css
/* Backgrounds */
--vm-base:           #010101;
--vm-surface:        rgba(28, 27, 36, 0.15);
--vm-card:           rgba(255, 255, 255, 0.03);
--vm-card-hover:     rgba(255, 255, 255, 0.06);

/* Borders */
--vm-border:         rgba(255, 255, 255, 0.05);
--vm-border-hover:   rgba(255, 255, 255, 0.10);
--vm-border-focus:   rgba(201, 103, 232, 0.40);

/* Text */
--vm-text-1:         #FFFFFF;
--vm-text-2:         rgba(255, 255, 255, 0.80);
--vm-text-3:         rgba(255, 255, 255, 0.50);

/* Gradient stops */
--vm-gradient-start: #FA93FA;
--vm-gradient-mid:   #C967E8;
--vm-gradient-end:   #983AD6;

/* Status */
--vm-success:        #34D399;
--vm-warning:        #FBBF24;
--vm-error:          #F87171;
--vm-info:           #60A5FA;
```

### Tailwind Shorthands

| Pattern | Classes |
|---------|---------|
| Primary gradient | `bg-gradient-to-br from-[#FA93FA] via-[#C967E8] to-[#983AD6]` |
| Glass surface | `bg-[rgba(28,27,36,0.15)] backdrop-blur-md border border-white/5` |
| Glass card | `bg-white/[0.03] backdrop-blur-md border border-white/5` |
| Glass card hover | `bg-white/[0.06] backdrop-blur-md border border-white/10` |
| Text gradient (hero) | `bg-gradient-to-br from-white via-purple-300 to-pink-400 bg-clip-text text-transparent` |

### Usage Rules

| Token | Use For | Never Use For |
|-------|---------|---------------|
| `--vm-base` | Page background | Card backgrounds |
| `--vm-surface` | Announcement pills, nav bars | Body background |
| `--vm-card` / `--vm-card-hover` | Metric cards, panels | Page background |
| Primary gradient | Accent icons, hero text, CTA icon | Body text, large fills |
| `--vm-text-1` | Headlines, primary text | Muted labels |
| `--vm-text-2` | Subheadlines, body text | Placeholders |
| `--vm-text-3` | Captions, placeholders, muted labels | Headlines |

---

## 3. Typography

### Font Stack

| Font | Role | Source | Variable |
|------|------|--------|----------|
| Geist Sans | Primary — headings, UI, body | `next/font/google` | `--font-geist-sans` |
| Geist Mono | Metric values, code, technical strings | `next/font/google` | `--font-geist-mono` |

No other fonts. Both are already loaded in `layout.tsx`.

### Type Scale

| Role | Size | Weight | Font | Tailwind Classes |
|------|------|--------|------|-----------------|
| Hero headline | 48px → 80px | 700 | Geist Sans | `text-5xl md:text-7xl lg:text-[80px] font-bold` |
| Page title | 28px | 700 | Geist Sans | `text-3xl font-bold` |
| Section title | 20px | 600 | Geist Sans | `text-xl font-semibold` |
| Body | 16px | 400 | Geist Sans | `text-base` |
| Body small | 14px | 400 | Geist Sans | `text-sm` |
| Label | 12px | 500 | Geist Sans | `text-xs font-medium` |
| Metric value | 32px | 700 | Geist Mono | `text-3xl font-bold font-mono` |
| Caption | 11px | 400 | Geist Sans | `text-[11px]` |

### Gradient Text

For hero headlines only:

```css
.vm-gradient-text {
  background: linear-gradient(to bottom right, #FFFFFF 30%, #C967E8 70%, #FA93FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

Or inline with Tailwind: `bg-gradient-to-br from-white via-purple-300 to-pink-400 bg-clip-text text-transparent`

---

## 4. Glassmorphism System

### Layer Stack

| Layer | Background | Blur | Border | Z-Index | Use |
|-------|-----------|------|--------|---------|-----|
| Base | `#010101` | none | none | — | Page body |
| Glass surface | `rgba(28,27,36,0.15)` | `backdrop-blur-md` | `border-white/5` | — | Announcement pills, nav |
| Glass card | `bg-white/[0.03]` | `backdrop-blur-md` | `border-white/5` | — | Metric cards, panels |
| Glass card (hover) | `bg-white/[0.06]` | `backdrop-blur-md` | `border-white/10` | — | Card hover state |
| Glass elevated | `bg-black/20` | `backdrop-blur-sm` | `border-white/5` | — | Logo cloud bar |
| Modal overlay | `bg-black/60` | `backdrop-blur-xl` | none | 50 | Modal backdrop |
| Modal surface | `bg-[#0a0a0a]/90` | `backdrop-blur-xl` | `border-white/5` | 51 | Modal content |

### Gradient Overlay (for video sections)

```
bg-gradient-to-b from-[#010101] via-transparent to-[#010101]
```

Apply as an absolutely-positioned overlay div inside the video container.

---

## 5. Spacing & Layout

### Page Layout

| Token | Value | Use |
|-------|-------|-----|
| Max width | `max-w-7xl` | Content containers |
| Page padding | `px-4 sm:px-6 lg:px-8` | Horizontal gutters |
| Section gap | `space-y-16 md:space-y-24` | Between landing page sections |
| Card padding | `p-4 sm:p-6` | Inside glass cards |
| Card grid gap | `gap-4 sm:gap-6` | Between metric cards |
| Inline gap | `gap-3` | Form elements, button groups |
| Tight gap | `gap-2` | Badges, chips, small items |

### Border Radius

| Value | Use |
|-------|-----|
| `rounded-lg` (8px) | Inputs, small badges |
| `rounded-xl` (12px) | Cards, panels |
| `rounded-2xl` (16px) | Large containers, modals |
| `rounded-full` | CTA buttons, pills, avatar |

---

## 6. Animation & Motion

### Library

`motion/react` (formerly Framer Motion) for all JavaScript animations. CSS `@keyframes` for simple utility animations only.

### Patterns

| Pattern | Config | Use |
|---------|--------|-----|
| Fade up | `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` | Card entrances, section reveals |
| Stagger | `staggerChildren: 0.05` (50ms) | Metric card grid reveals |
| Spring | `{ type: "spring", stiffness: 300, damping: 30 }` | Interactive/layout animations |
| Counter | Animated count from 0 → target value | Metric number displays |
| Infinite slider | Horizontal loop with `motion/react` | Logo cloud |
| Layout animation | `layoutId` prop for shared element transitions | Dashboard tile → modal expand |

### Easing

| Context | Curve |
|---------|-------|
| CSS transitions | `cubic-bezier(0.22, 1, 0.36, 1)` |
| motion/react default | `{ type: "spring", stiffness: 300, damping: 30 }` |
| Entrance animations | `{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }` |

### CSS Keyframes (defined in globals.css)

```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Reduced Motion (MANDATORY)

Every animation must be gated by `prefers-reduced-motion`. This applies to:
- motion/react: use `useReducedMotion()` hook
- CSS keyframes: wrap in `@media (prefers-reduced-motion: no-preference)`
- Infinite sliders: pause when reduced motion is preferred
- Counter animations: show final value immediately

---

## 7. Component Patterns

### Announcement Pill

```
bg-[rgba(28,27,36,0.15)] border border-white/5 rounded-full px-4 py-2
```
- Gradient-filled icon box (Zap) with glow: `bg-gradient-to-br from-[#FA93FA] to-[#983AD6] rounded-md p-1 shadow-[0_0_12px_rgba(201,103,232,0.4)]`
- Text: `text-white/70 text-sm`

### CTA Button (Primary)

```
rounded-full bg-white text-black font-medium px-6 py-3
```
- Arrow icon circle: `bg-gradient-to-br from-[#FA93FA] to-[#983AD6] rounded-full p-1`
- Outer wrapper: glass border effect

### CTA Button (Ghost)

```
rounded-full bg-white/[0.05] border border-white/10 text-white/80 px-6 py-3
hover:bg-white/[0.08] hover:border-white/15
```

### Glass Card (Metric)

```
bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-xl p-4 sm:p-6
hover:bg-white/[0.06] hover:border-white/10 transition-colors
```
- Metric value: `text-3xl font-bold font-mono text-white`
- Label: `text-xs font-medium text-white/50 uppercase tracking-wider`

### URL Input

```
bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30
focus:border-[rgba(201,103,232,0.4)] focus:ring-1 focus:ring-[rgba(201,103,232,0.2)] focus:outline-none
```

### Modal

- Overlay: `fixed inset-0 bg-black/60 backdrop-blur-xl z-50`
- Surface: `bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6`
- Use `layoutId` for expand/collapse from dashboard tile

### Dashboard Video Tile

```
bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden cursor-pointer
hover:bg-white/[0.06] hover:border-white/10 transition-colors
```
- Thumbnail: `w-full aspect-video object-cover`
- Title: `text-sm font-medium text-white truncate`
- Date: `text-xs text-white/50`

---

## 8. Hero Video

### Implementation

- **Library**: `hls.js` with native `<video>` tag
- **NOT**: react-player (do not use)
- **Pattern**: Custom `useEffect` hook that initializes `hls.js` on the video element

### HLS Source

```
https://customer-cbeadsgr09pnsezs.cloudflarestream.com/697945ca6b876878dba3b23fbd2f1561/manifest/video.m3u8
```

### MP4 Fallback

```
/_videos/v1/f0c78f536d5f21a047fb7792723a36f9d647daa1
```

### Styling

| Property | Value | Reason |
|----------|-------|--------|
| Blend mode | `mix-blend-screen` | Black video background blends into page |
| Position | Bottom of hero, `-mt-[150px]` | Overlaps behind hero text |
| Z-index | Video: `z-10`, text: `z-20` | Text floats above video |
| Width | `w-full`, auto height | Edge-to-edge, no cropping |
| Overlay | `from-[#010101] via-transparent to-[#010101]` | Gradient fade at edges |

**Do NOT** use `object-contain`, fixed heights, or any dimension that crops the video.

---

## 9. Icons

### Library

`lucide-react` exclusively. No other icon libraries.

### Size Conventions

| Context | Size |
|---------|------|
| Navigation | 16px (`w-4 h-4`) |
| Buttons | 14–16px (`w-3.5 h-3.5` or `w-4 h-4`) |
| Card icons | 12–14px |
| Hero pill | 16px (`w-4 h-4`) |
| Empty states | 24–32px (`w-6 h-6` or `w-8 h-8`) |
| Loading spinner | 16–20px with `animate-spin` |

### Key Icon Mapping

| Icon | Use |
|------|-----|
| `Zap` | Announcement pill |
| `ArrowRight` | CTA buttons |
| `Play` | Video-related actions |
| `BarChart3` | Analytics/metrics |
| `Search` | URL input |
| `Save` | Save analytics |
| `Loader2` | Loading states (with `animate-spin`) |
| `X` | Close/dismiss |
| `User` | Account/auth |
| `LogOut` | Sign out |

Custom SVG paths may be used for specific UI elements not covered by lucide-react.

---

## 10. Scrollbar

Define in `globals.css`:

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.10);
}
```

---

## 11. Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| Use light backgrounds (`white`, `zinc-50`, `gray-100`) | Use `#010101` base + glass surfaces |
| Use solid card backgrounds (`bg-zinc-900`, `bg-gray-800`) | Use glass: `bg-white/[0.03]` + `backdrop-blur` |
| Hardcode hex for semantic UI tokens | Use `var(--vm-*)` custom properties |
| Use any font besides Geist Sans / Geist Mono | Stick to the loaded font stack |
| Import icons from anywhere but `lucide-react` | `lucide-react` only |
| Use `react-player` for video | Native `<video>` + `hls.js` |
| Skip `prefers-reduced-motion` gate | Gate every animation — no exceptions |
| Use `object-contain` or fixed heights on hero video | `w-full` auto-height edge-to-edge |
| Mix light-mode and dark-mode styles | Dark-only app — no `prefers-color-scheme` toggle |
| Apply gradient to body text | Gradient text only for hero headlines |
| Use borders heavier than `white/10` | `white/5` is standard; `white/10` for hover only |
| Add `font-family` declarations in components | Fonts are set globally via CSS variables |
| Use `rounded-md` for cards | Cards use `rounded-xl`; only inputs use `rounded-lg` |

---

## 12. File References

| File | Purpose |
|------|---------|
| `.claude/brand-book.md` | This file — design system source of truth |
| `src/app/globals.css` | CSS custom properties, keyframes, scrollbar |
| `src/app/layout.tsx` | Font loading (`--font-geist-sans`, `--font-geist-mono`), app shell |
| `SPEC.md` | Product spec with original design requirements |
| `CLAUDE.md` | Project conventions — references this brand book |
