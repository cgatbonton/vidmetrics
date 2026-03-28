# CLAUDE.md — src/components/

Component-specific patterns and gotchas. See root `CLAUDE.md` for project-wide rules.

## Pagination & Filtering

### Reset Pagination on Every Filter Change
- When a component has independent pagination state (`visibleCount`) and filter state, every filter change handler must reset `visibleCount` to `PAGE_SIZE`.
- Never rely on `useMemo` to fix stale pagination — it recalculates the slice but doesn't reset the count.
- Pattern in `VideoGrid.tsx`: each filter handler calls `resetPage()` after updating filter state.

### Export Actions Operate on Filtered Data
- Any export action (CSV, copy, share) must operate on the derived/filtered data that represents the user's current view, not the unfiltered source array.
- The user's expectation is "export what I'm looking at."
- Pattern: `downloadCsv(filteredAndSorted, ...)` — never `downloadCsv(videos, ...)`.

## Auth in Components

### Infer Auth State from 401, Not Auth Context
- When a component is accessible to both anonymous and authenticated users, derive auth state from API response codes (401 = not authenticated) rather than importing the auth context.
- This avoids coupling the component to an auth provider it may not always be wrapped in.
- Pattern in `useVideoAiAnalysis`: fires the API request, sets `isAuthenticated = false` on 401.

### Deduplication Guards Use Refs, Not State
- When a `useCallback` with an empty dep array needs to guard against concurrent invocations (e.g., double-click), use a `useRef` flag rather than a state variable.
- State captured in a stable callback closure is stale; a ref is always live.
- Pattern: `const isGeneratingRef = useRef(false)` inside the callback.

## AI Integration

### All AI JSON Parsing Uses `parseAiJson`
- Never call `JSON.parse` directly on AI output — models produce markdown-wrapped JSON despite explicit prompt instructions.
- Use `parseAiJson` from `src/lib/ai-utils.ts` (two-pass: direct parse, then strip markdown fences and retry).

### Sanitize Client Objects Before AI Generation
- When a route passes client-supplied data to an AI generation function, construct a sanitized object with only the known, validated fields.
- Never pass `body.someObject` directly — unknown fields can pollute the prompt or introduce injection surface.
