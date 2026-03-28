# CLAUDE.md — VidMetrics

## Project Overview

YouTube channel analytics tool. Paste a channel URL, get scored video performance metrics (VMS scores), content type breakdowns, and AI-powered strategy analysis. Users can save channel analyses to their account for later reference.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 5
- **Database**: Supabase (Postgres + Auth + RLS)
- **Styling**: Tailwind CSS 4
- **Animation**: `motion/react` (Framer Motion)
- **Icons**: `lucide-react`
- **AI**: OpenAI (content analysis via `src/lib/openai.ts`)
- **Video**: HLS.js for video playback

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── analyze/        # POST — channel analysis endpoint
│   │   ├── saved-channels/ # GET/POST — saved channel analyses
│   │   ├── saves/          # GET/POST — saved video analyses (legacy)
│   │   ├── snapshots/      # Metric snapshots over time
│   │   ├── register/       # User registration
│   │   ├── login/          # User login
│   │   └── logout/         # User logout
│   ├── dashboard/          # Authenticated dashboard (saved analyses)
│   ├── analytics/          # Analytics detail views
│   └── settings/           # User settings
├── components/
│   ├── auth/               # AuthForm, AuthModal
│   ├── channel/            # VideoGrid, VideoTile, VideoToolbar, VideoDetailModal
│   ├── charts/             # EngagementRadar, ViewsOverTimeChart
│   ├── dashboard/          # AnalyticsModal, SavedAnalysisTile
│   ├── landing/            # Hero, UrlInput, AnalyticsSection
│   ├── layout/             # Navbar, Footer
│   └── ui/                 # Button, Modal, Toast (shared primitives)
├── hooks/                  # useAnalyze, useSavedChannels, useSaves, useSnapshots, etc.
├── lib/
│   ├── auth/               # get-actor.ts, auth-context.tsx
│   ├── db/                 # mappers.ts (DB row → domain object)
│   ├── supabase/           # client.ts, server.ts (browser/server Supabase clients)
│   ├── metrics.ts          # VMS score computation
│   ├── youtube.ts          # YouTube Data API integration
│   ├── ai-analysis.ts      # AI-powered content analysis
│   ├── content-types.ts    # Content type classification
│   ├── errors.ts           # Structured error definitions
│   ├── audit.ts            # Audit logging
│   └── events.ts           # Event emission
├── types/
│   ├── analysis.ts         # VideoAnalysis, ChannelAnalysis, ScoredVideo, SavedChannel
│   └── api.ts              # Actor, StructuredError
└── middleware.ts            # Route protection (dashboard, settings, analytics)
supabase/
└── migrations/             # SQL migrations (run in Supabase SQL Editor)
```

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |

## Testing Conventions

### Behavioral Tests Only (Non-Negotiable)

Every test must verify **observable behavior** (inputs → outputs, state transitions, side effects that matter), never implementation details. A test that would break when the code is refactored without changing behavior is wrong.

| Do | Don't |
|---|---|
| Assert on return values and final state | Assert on mock call parameters for internal wiring |
| Assert on observable side effects (events emitted, state changed) | Assert on how many times an internal function was called |
| Call the real function with test inputs and check outputs | Read source code with regex and match structure |
| Test via the public API / exported function | Assert on internal query chain construction |

## Code Conventions

### General Rules

- Use named constants over magic numbers
- Keep functions small and focused (single responsibility)
- Self-documenting code over comments
- Hide implementation details, expose clear interfaces

### File Naming

- **Components**: PascalCase (`VideoGrid.tsx`, `AuthModal.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAnalyze.ts`, `useSavedChannels.ts`)
- **Lib modules**: kebab-case (`ai-analysis.ts`, `content-types.ts`)
- **API routes**: kebab-case directories (`saved-channels/route.ts`)
- **Types**: camelCase files, PascalCase exports (`analysis.ts` → `ChannelAnalysis`)

### Type Ownership — One Definition, One Location
- A shared type belongs in the module that produces or parses the data it describes.
- All consumers import from that single source. Never define the same interface or type in two files in the same directory tree.
- Before defining a new type, grep `src/types/` and the relevant domain module to confirm it doesn't already exist under a different name.

## Design System

**VidMetrics uses a dark glassmorphism design system. Before any UI work, load the brand book.**

- **Brand book**: `.claude/brand-book.md` — single source of truth for all visual decisions
- **Aesthetic**: Dark (`#010101` base), glass surfaces with `backdrop-blur`, pink-to-purple gradient accents (`#FA93FA` → `#C967E8` → `#983AD6`)
- **Fonts**: Geist Sans (primary) + Geist Mono (metrics/code) — loaded in `layout.tsx`
- **Icons**: `lucide-react` exclusively
- **Motion**: `motion/react` library, 50ms stagger, fade-up entrances, animated counters, `prefers-reduced-motion` gate mandatory
- **Tokens**: All colors use `--vm-*` CSS custom properties defined in `globals.css`
- **Critical**: Dark-only app. Never use light backgrounds, solid card fills, or light-mode borders.

**All agents must read `.claude/brand-book.md` before writing any component, page, or style code.**

## Important Notes

- Never use "you're right" or variations
- Don't summarize changes made
- **Always verify no infinite loops** after making changes — check that dependency arrays, watchers, or reactive systems don't cause circular updates
- **Suggest refactoring large files** — if editing a file causes it to exceed 500 lines, suggest breaking it into smaller, focused modules
- **After extracting helpers, verify wiring immediately** — extracted modules are dead code until the parent imports and calls them. After creating a new module from existing inline logic: (1) grep for the extracted function name in the parent file to confirm it appears as an import + call site, (2) remove the old inline definition. "Extracted" is not done until the inline code is gone.
- **Delete backup files before completing any task** — run `find . -name "*.backup.*"` in affected directories before marking done. Never commit `.backup.*` files.
- **Extract shared utilities at the second consumer, not the third** — when wiring a formatter, transformer, or helper to a second callsite, extract it to a shared module immediately. Do not defer until a third callsite appears.
- **Git branch safety**: Never merge into the production branch unless explicitly told to merge to production.
- **Centralize duplicated constants when extracting** — when extracting helpers that share a named constant with the parent file, move the constant to the deepest module that uses it and import it upward. Never define the same constant in two modules in the same directory tree.

## Agent-First Architecture (MANDATORY)

**All new code must follow agent-first patterns.** Use the `/agent-first` skill as the authoritative reference. The philosophy: build the agentic skeleton now, dress it in human clothes. Every action a human takes through the UI goes through the same code path an agent would use via the API.

### Non-Negotiable Requirements

Every new API route, service, or feature must include:

1. **Command Layer** — Structured commands with actor attribution (works for humans, agents, and system)
2. **Structured Errors** — `{ code, reason, remediation }` on every error (never bare string messages)
3. **Event Emission** — Emit a structured event after every state change (even if nothing listens yet)
4. **Audit Trail** — Log every mutation with who, what, when, why
5. **Canonical State Response** — Return entity + `constraints` + `nextActions` so callers know what's possible
6. **Composable Actions** — Atomic, reversible operations. No hardcoded step sequences

### UI-Route Parity (Non-Negotiable)

Every UI mutation must go through an API route. The UI never calls the database directly for mutations. This ensures agents have the same capabilities as humans.

| Check | Pass Criteria |
|-------|--------------|
| UI mutations use API routes | No direct database calls from client code for mutations |
| Every UI action has a corresponding API route | No orphan mutations that skip the API layer |
| CRUD parity | If the UI can create, read, update, delete — the API supports all four |
| Response shape consumed correctly | UI reads `constraints` and `nextActions` from the API response |

### Anti-Patterns to Reject

| Don't | Do Instead |
|-------|-----------|
| UI calls database directly | Route through API endpoint with command structure |
| `{ error: "something broke" }` | `{ code: "THING_FAILED", reason: "...", remediation: "..." }` |
| Hardcoded workflow step1→step2→step3 | Independent atomic actions composed by orchestration layer |
| No actor on mutations | `actor: { type, id, humanPrincipal }` on every command |
| Raw entity response | Entity + `constraints` + `nextActions` |
| Two separate code paths for human vs agent | One code path, same API for both |

### Schema Design

New database tables should include agentic slots (nullable, populated in later phases):
- `tags` (json) — classification/labeling
- `scores` (json) — predictive/performance scores
- `constraints` (json) — what can be done with this entity
- `edit_history` (json) — track all edits

### Reference

Full patterns, code examples, and checklists: `.claude/skills/agent-first/`

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop (MANDATORY — not optional)

**The Observer agent handles lesson capture automatically.** Spawn it at the end of every non-trivial task:

> "Use the observer agent to review what was just built."

The Observer will read recent git changes, extract lessons, write to `tasks/lessons.md`, and graduate stable patterns to the nearest CLAUDE.md. Do not skip this step.

**You must still capture lessons inline when:**
- The user corrects you mid-task (write the entry immediately, don't wait for Observer)
- A task is too small for a subagent (single-file fix, typo, etc.)

**Graduation path**: Pending → Validated (confirmed by repeat/application) → Graduate to target CLAUDE.md → Prune from lessons.md
- Review `tasks/lessons.md` at session start — graduate mature lessons, prune stale entries
- Before adding, check MEMORY.md and target CLAUDE.md — don't duplicate existing content
- **Update the nearest CLAUDE.md** when you discover stable patterns (see Living Documentation below)
- **Learn From Mistakes (STRICT)**: If you make a mistake — wrong assumption, incorrect API usage, missed edge case — immediately update the relevant CLAUDE.md with a rule that prevents it from recurring. Every mistake is a future rule. No exceptions.

### 3b. Guardrail Skills — Recurring Issue Prevention

When you notice the same class of bug recurring (3+ occurrences), create a **guardrail skill** in `.claude/skills/` that auto-triggers to prevent it. These are distinct from user-invoked skills — they activate automatically when their trigger conditions are met during normal work.

**When to create a guardrail skill:**
- A bug class has appeared 3+ times
- The fix pattern is well-understood and can be codified
- CLAUDE.md rules alone aren't preventing the issue (a skill provides structured audit steps)

**Structure:** Same as regular skills but with strong "When to Use" triggers tied to observable context

**Logging (MANDATORY):** Every guardrail skill must append to `tasks/skill-trigger-log.md` when it activates. This lets us review trigger effectiveness and harden or retire skills.

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Run Observer (REQUIRED)** — see Self-Improvement Loop above. Cannot be skipped for non-trivial tasks.

## Feature-Specific Instructions (auto-loaded by directory)

| Directory | Reference |
|-----------|-----------|
| Agent-First patterns | `.claude/skills/agent-first/` |
| Design system | `.claude/brand-book.md` |

## Living Documentation — CLAUDE.md Maintenance

CLAUDE.md files are living documents. **Update them as you work.**

### When to update

- You discover a gotcha, workaround, or non-obvious pattern while building in a directory
- A new convention emerges (naming, file structure, component pattern, API shape)
- You hit an error caused by missing context that a future agent would also hit
- The user corrects you on something domain-specific (not a one-off mistake — a rule)
- You add a new integration, tool, or subsystem that future work needs to know about

### Where to update

Write to the **nearest** CLAUDE.md in the directory tree:

| Working in... | Update... |
|---------------|-----------|
| A specific subdirectory with its own CLAUDE.md | That subdirectory's CLAUDE.md |
| Cross-cutting / project-wide | Root `CLAUDE.md` |
| New directory with no CLAUDE.md | Create one if 3+ non-obvious rules accumulate |

### Rules

- **Keep it concise** — bullet points and tables, not paragraphs
- **No session-specific notes** — only stable, verified patterns that apply across sessions
- **Don't duplicate** — if the root CLAUDE.md already covers it, don't repeat in a child file
- **Remove stale info** — if a pattern changes, update or delete the old entry
- **Append, don't rewrite** — add new sections; don't reorganize the whole file unless asked

### End-of-Task Checklist (BLOCKING — complete before responding "done")

**At the end of every task**, run through each item. Do not say the task is complete until this list is done:

1. **Observer agent (REQUIRED for non-trivial tasks)** — see Self-Improvement Loop. For trivial tasks (single-line fix, typo), skip and note why.
2. **Component/hook/service pattern** — Did I introduce a new one? → Document in the relevant CLAUDE.md.
3. **Architectural rule** — Was a stable rule confirmed or violated? → Update the appropriate file.

**Skipping step 1 without justification is a failure.**

## Integration & Runtime Gotchas

### Git Worktree Checkout Destroys Untracked Files
- `git checkout` into a worktree path destroys any untracked files in that path — they are not protected by git and cannot be recovered.
- Before any checkout or worktree operation, run `git status` to confirm no untracked files exist in the target path.

### `Promise.all` for Independent Async Fetches (Non-Negotiable)
- Two or more `await` calls with no data dependency between them must always be `Promise.all`. Sequential awaits on independent calls is a performance bug.
- Wrong: `const a = await fetchA(); const b = await fetchB();`
- Correct: `const [a, b] = await Promise.all([fetchA(), fetchB()]);`

### `AnimatePresence` Required for `motion` Exit Animations
- `exit` props on `motion` elements are silently ignored without an `AnimatePresence` wrapper. The element unmounts immediately with no animation.
- Every component that uses `exit` variants must wrap the conditionally-rendered `motion` element in `AnimatePresence`.

### `VmsVideoInput.duration` Must Be ISO 8601
- `computeVmsScores` in `src/lib/metrics.ts` calls `formatDuration` internally. The `duration` field must be a raw ISO 8601 string (e.g. `"PT12M34S"`).
- Never pre-format duration to a human-readable string before passing into `VmsVideoInput`. The scorer owns the formatting step.

### SSR Guard for `createPortal`
- `createPortal(children, document.body)` crashes during SSR — `document` is undefined on the server even for `'use client'` components during hydration.
- Every component that calls `createPortal` must guard with a `mounted` state:
  ```tsx
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  ```

### Callback Props in `useEffect` — Use a Ref
- Never include callback props in `useEffect` dependency arrays. New function identity on parent re-renders causes extra effect runs or infinite loops.
- Pattern: store the callback in a ref and call it from inside the effect:
  ```ts
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  // inside effect:
  callbackRef.current(result);
  ```

### Auth Helpers Must Return Null, Not Throw
- Auth helpers that check session state must return `null` for unauthenticated callers — never throw.
- Throwing masks infrastructure failures (auth service down, network error) and prevents callers from distinguishing "not logged in" from "auth broken".
- Use `getAuthenticatedActor()` → returns `Actor | null`. The route owns the 401 response.

### Actor Identity Predicates Live in `src/lib/auth/get-actor.ts`
- Never inline `actor.type === "system" && actor.id === "anonymous"` in route files.
- All actor predicates (`isAnonymous`, etc.) are exported from `src/lib/auth/get-actor.ts`.

### DB Record Mappers Live in `src/lib/db/mappers.ts`
- All Supabase record → domain object transforms go in `src/lib/db/mappers.ts`.
- Extract at the second callsite — inlining in 3+ places causes field-level drift.

### UI Must Not Own API Request Body Shape
- UI components must never construct API request bodies directly.
- All mutations route through a dedicated hook (e.g. `useSaves.saveAnalysis`) that owns the canonical request shape.
- This prevents silent field-name mismatches between the caller and the route's validation schema.

### Supabase `getUser()` vs `getSession()` — Know the Difference
- `getUser()` makes a network call to validate the JWT with Supabase. Use it when granting access to a resource (auth helpers, protected routes).
- `getSession()` reads the session cookie locally — no network call. Use it when you only need the user ID from an already-established session (e.g., attributing an audit log on logout).
- Never use `getSession()` alone for trusted auth checks — it reads unvalidated local storage. Never use `getUser()` where a cookie read suffices — it adds network latency.
- After a server-side `signOut()`, the client must call `window.location.reload()` (or redirect) to flush the in-memory auth state. The auth context only re-initializes from cookies on mount.

### `localStorage` vs `sessionStorage` for Cross-Tab Signals
- `sessionStorage` is scoped to the originating tab. A flag set in one tab is invisible in any other tab — including a tab opened from an email confirmation link.
- When a flag must be readable after the user switches tabs (e.g., clicks an email link in a new tab), use `localStorage`.
- Use `sessionStorage` only for transient, single-tab state that should not persist across navigation or tab switches.

### Supabase `SIGNED_IN` Event Fires in All Open Tabs
- `onAuthStateChange` emits `SIGNED_IN` in every open tab when the user confirms their email or logs in — not just in the tab that triggered the action.
- This makes it the correct hook for triggering post-confirmation side effects (e.g., claiming pending server-side data). The claim fires regardless of which tab the user confirmed from.
- `USER_UPDATED` also fires on confirmation but does not reliably signal a completed sign-in state across all Supabase versions.

### Pre-Auth Server-Side Pending Row Pattern
- When a user triggers a save action before email confirmation, browser state (sessionStorage, in-memory) cannot hold the data — any tab close or navigation loses it.
- Correct pattern: (1) store the pending data server-side at registration time, keyed by the user's email; (2) set a `localStorage` flag so all tabs know to claim; (3) call the claim endpoint on the `SIGNED_IN` auth event; (4) TTL-delete stale unclaimed rows on every claim pass.
- Never thread pending data through URL params, sessionStorage, or client state across the email confirmation boundary.

### RLS for Pre-Auth Inserts with Post-Auth Owner Restriction
- Tables that need to accept server-side inserts before the user has a confirmed session (e.g., `pending_saves`) but must restrict reads and deletes to the confirmed owner use a split policy:
  - INSERT: `WITH CHECK (true)` — the API route owns the validation, not RLS.
  - SELECT/DELETE: `USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))` — joins the row's email against the confirmed user.
- Never rely on RLS alone to validate pre-auth inserts. The server route must validate the payload shape before inserting.

### Validate Client-Supplied JSONB Blobs at the Route Boundary
- Supabase will accept any valid JSON into a JSONB column. A malformed domain object stored as JSONB only surfaces as a runtime error at read/claim time, not at write time.
- Always validate required fields of any client-supplied JSONB payload at the API route boundary before inserting. Drop invalid blobs silently rather than storing unclaimable data.

### ERRORS Catalog — Always Use `errorResponse(key)`, Never Inline Strings
- When an error code exists in the `ERRORS` catalog in `src/lib/errors.ts`, call `errorResponse(key)`. Never inline the error `code`, `reason`, or `remediation` strings directly.
- This applies to route handlers AND shared helpers (e.g., `checkRateLimit`) that return error responses — they are not exempt from the catalog rule.
- Reserve `createErrorResponse()` only for errors with no catalog entry.

### Serverless Rate Limiters — Lazy Init, Fail-Open on Missing Env Vars
- Rate limiter initialization that reads env vars must be lazy and guarded. If `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` are absent, `getRedis()` returns `null`. All limiters are `null` when Redis is unavailable.
- `checkRateLimit(null, id)` must return `{ limited: false }` — a missing Redis config produces fail-open behavior, not a startup crash. This is critical for local dev, test, and preview deploys where Redis may not be configured.
- Also: catch errors inside `checkRateLimit` and fail-open if Redis throws during a request — Redis being down must not take down the route.

### Tiered Rate Limits by Auth State
- Endpoints that serve both anonymous and authenticated traffic need two separate limiters: a tighter limit keyed on IP for anonymous callers, a looser limit keyed on `actor.id` for authenticated callers.
- Resolve the actor first (one `getActor()` call), then select the limiter: anonymous → IP key, authenticated → user ID key.
- Pattern in `src/app/api/analyze/route.ts`: `const limiter = isAnonymous(actor) ? analyzeLimiter : analyzeAuthLimiter`.

### Call `getActor()` Once Per Request; Pass Actor as Parameter
- Call `getActor()` exactly once at the top of the route handler. Pass the resolved `Actor` to any sub-handlers as a parameter.
- Never call `getActor()` inside a helper that is invoked from a route that already resolved the actor — each call makes a Supabase JWT validation network request.
