# Evolution Report — VidMetrics (All Time)

**Generated**: 2026-03-28
**Period**: 2026-03-27 to 2026-03-28 (project inception to present)

---

## Section 1: Executive Summary

In just two commits and one intensive build session, the VidMetrics codebase went from a scaffold with a placeholder CLAUDE.md to a deeply instrumented agentic knowledge base. Agents captured 24 lessons (16 graduated to permanent rules), autoresearched 2 artifacts to perfect scores, added 20 runtime gotcha rules to CLAUDE.md, and established the agent-first architecture as a non-negotiable foundation. The knowledge density is exceptionally high for a 2-commit project — nearly every lesson was captured and graduated in the same session, indicating fast feedback loops between building and learning.

---

## Section 2: Knowledge Growth Timeline

```
DATE          TYPE     Description
──────────────────────────────────────────────────────────────────────────────
2026-03-27    PATTERN  Agent-first architecture established as mandatory foundation
2026-03-27    RULE     CLAUDE.md — filled in from scaffold: tech stack, structure, conventions
2026-03-27    RULE     CLAUDE.md — Type Ownership: one definition, one location
2026-03-27    RULE     CLAUDE.md — Git Worktree Checkout Destroys Untracked Files
2026-03-27    RULE     CLAUDE.md — Promise.all for Independent Async Fetches
2026-03-27    RULE     CLAUDE.md — AnimatePresence Required for motion Exit Animations
2026-03-27    RULE     CLAUDE.md — VmsVideoInput.duration Must Be ISO 8601
2026-03-27    RULE     CLAUDE.md — SSR Guard for createPortal
2026-03-27    RULE     CLAUDE.md — Callback Props in useEffect: Use a Ref
2026-03-27    RULE     CLAUDE.md — Auth Helpers Must Return Null, Not Throw
2026-03-27    RULE     CLAUDE.md — Actor Identity Predicates in get-actor.ts
2026-03-27    RULE     CLAUDE.md — DB Record Mappers in mappers.ts
2026-03-27    RULE     CLAUDE.md — UI Must Not Own API Request Body Shape
2026-03-27    RULE     CLAUDE.md — getUser() vs getSession() distinction
2026-03-27    RULE     CLAUDE.md — localStorage vs sessionStorage for Cross-Tab Signals
2026-03-27    RULE     CLAUDE.md — SIGNED_IN Event Fires in All Open Tabs
2026-03-27    RULE     CLAUDE.md — Pre-Auth Server-Side Pending Row Pattern
2026-03-27    RULE     CLAUDE.md — RLS for Pre-Auth Inserts with Post-Auth Owner Restriction
2026-03-27    RULE     CLAUDE.md — Validate Client-Supplied JSONB Blobs at Route Boundary
2026-03-27    RULE     CLAUDE.md — ERRORS Catalog: Always Use errorResponse(key)
2026-03-27    RULE     CLAUDE.md — Serverless Rate Limiters: Lazy Init, Fail-Open
2026-03-27    RULE     CLAUDE.md — Tiered Rate Limits by Auth State
2026-03-27    RULE     CLAUDE.md — Call getActor() Once Per Request
2026-03-27    LESSON   24 lessons captured, 16 graduated in first session
2026-03-27    SKILL    autoresearch: hero-copy — 3/5 → 5/5 (competitive framing)
2026-03-27    SKILL    autoresearch: ai-analysis-prompt — 11/18 → 18/18 (rival framing + field-level instructions)
2026-03-27    MEMORY   SPEC.md landing page reference is design-only (feedback memory)
```

---

## Section 3: Skill Evolution

### SKILL: Hero Copy (autoresearch)
- **Baseline**: 3/5
- **Final**: 5/5 (2 rounds, 2 kept, 0 reverted)
- **Key mutations**:
  - Headline reframed from generic "Unlock Your Video's Full Potential" to competitive "See What Your Competitors Can't Hide"
  - Subheader shifted from passive "see metrics" to active "reveal gaps in their strategy"
- **Impact**: Landing page copy now positions VidMetrics as competitive intelligence, not a generic metrics viewer

### SKILL: AI Analysis Prompt (autoresearch)
- **Baseline**: 11/18
- **Final**: 18/18 (2 rounds, 2 kept, 0 reverted)
- **Key mutations**:
  - Round 1: Added explicit rival-framing instruction — RIVAL_FRAMING 0/3 → 3/3
  - Round 2: Replaced generic field descriptions with specific output requirements (cross-type comparison, cadence patterns, evidence-backed gaps)
- **Impact**: AI analysis output now reliably includes competitive framing, publishing cadence estimates, and data-backed gap identification
- **Key insight**: Embedding behavioral examples directly in JSON field descriptions produces near-100% compliance, vs. separate instruction sections

### Skills Installed (not autoresearched)
| Skill | Purpose |
|-------|---------|
| `agent-first` | Agent-first architecture patterns and checklists |
| `autoresearch` | Iterative artifact optimization |
| `autoresearch-skills` | Auto-improve skill prompts |
| `cost-analysis` | ROI calculation for Claude-built software |
| `debug` | Systematic root-cause debugging |
| `evolution-report` | This report |
| `frontend-design` | Production-grade frontend generation |
| `prop-drilling-minimizer` | Detect and fix prop drilling |
| `skill-creator` | Create and validate new skills |
| `spawn` | Parallel agent orchestration |

---

## Section 4: CLAUDE.md Mutations

### FILE: CLAUDE.md (root)

**Commit `230795a` — transformed from scaffold to comprehensive project guide:**

| Category | Rules Added | Examples |
|----------|------------|---------|
| Project context | 5 | Tech stack, project structure, key commands, design system reference |
| Code conventions | 3 | File naming, type ownership, one-definition rule |
| Integration gotchas | 20 | See full list in Section 2 timeline |

**Why each major gotcha category was added:**

| Rule | Triggered By |
|------|-------------|
| `Promise.all` for independent fetches | Critic caught sequential awaits on `fetchChannelWithAvatar` + `fetchRecentVideos` |
| `VmsVideoInput.duration` ISO 8601 | Critic caught double-format bug where pre-formatted duration mangled output |
| SSR Guard for `createPortal` | Modal crashed during hydration — `document.body` undefined |
| `AnimatePresence` for exit animations | Exit animation silently skipped — no error, just no animation |
| `getUser()` vs `getSession()` | Auth context used `getSession()` which reads unvalidated JWT |
| `errorResponse(key)` catalog rule | Same inline-string violation caught in 2 different files |
| Lazy Redis init / fail-open | Rate limiter crashed all routes when Redis env vars absent |
| Tiered rate limits | Single global limit punished authenticated users same as anonymous |
| `getActor()` once per request | Duplicate JWT validation network calls in sub-handlers |

---

## Section 5: Lessons Lifecycle

### Graduated (16 lessons → permanent CLAUDE.md rules)

| Lesson | Graduated To |
|--------|-------------|
| Git worktree checkout wipes untracked files | Integration & Runtime Gotchas |
| `VmsVideoInput.duration` must be ISO 8601 | Integration & Runtime Gotchas |
| `Promise.all` for independent fetches | Integration & Runtime Gotchas |
| `createPortal` + `AnimatePresence` for modals | Integration & Runtime Gotchas |
| Shared type: one definition, one location | Code Conventions > Type Ownership |
| `getUser()` not `getSession()` for auth validation | Integration & Runtime Gotchas |
| `localStorage` not `sessionStorage` for cross-tab | Integration & Runtime Gotchas |
| Server-side pending row for pre-auth saves | Integration & Runtime Gotchas |
| `SIGNED_IN` fires in every tab | Integration & Runtime Gotchas |
| Validate JSONB blobs at route boundary | Integration & Runtime Gotchas |
| RLS split policy for pre-auth inserts | Integration & Runtime Gotchas |
| `errorResponse(key)` for catalog errors | Integration & Runtime Gotchas |
| Lazy Redis init / fail-open | Integration & Runtime Gotchas |
| Tiered rate limits by auth state | Integration & Runtime Gotchas |
| `getActor()` once per request | Integration & Runtime Gotchas |
| `checkRateLimit` must use `errorResponse()` | Merged into errorResponse catalog rule |

### Pending (8 lessons — not yet graduated)

| Lesson | Target | Status |
|--------|--------|--------|
| Audit logs must never include PII | CLAUDE.md | captured |
| `.env.example` not `.env` for committed placeholders | CLAUDE.md | captured |
| Verify which route version exists before patching | CLAUDE.md | captured |
| Agent diff output must be validated before applying | CLAUDE.md | captured |
| Stale audit results must be reconciled before patching | CLAUDE.md | captured |
| Reset pagination when any filter changes | CLAUDE.md | captured |
| CSV export must reference filtered list | CLAUDE.md | captured |
| `getSession()` preferred when only user ID needed | CLAUDE.md | captured |
| Infer auth from 401 response, not auth context | CLAUDE.md | captured |
| Deduplication guard uses ref, not state | CLAUDE.md | captured |
| `parseAiJson` two-pass for markdown fences | CLAUDE.md | captured |
| Sanitize client objects before AI generation | CLAUDE.md | captured |

**Pattern**: All 16 graduated lessons were captured AND graduated in the same session (2026-03-27). This indicates the build session had high feedback density — lessons were immediately confirmed by second occurrences or critic reviews.

---

## Section 6: Agent Failure Modes Addressed

| Failure Mode | How It Was Caught | What Prevents It Now |
|-------------|------------------|---------------------|
| Sequential independent awaits | Critic review of analyze route | CLAUDE.md rule: `Promise.all` non-negotiable |
| Double-format duration bug | Critic review caught mangled output | CLAUDE.md rule: `VmsVideoInput.duration` ISO 8601 |
| SSR crash from `createPortal` | Runtime error during hydration | CLAUDE.md rule: mounted guard pattern |
| Silent exit animation skip | Visual QA — modal closed without animation | CLAUDE.md rule: `AnimatePresence` wrapper |
| Auth using unvalidated JWT | Security review of auth context | CLAUDE.md rule: `getUser()` vs `getSession()` |
| Inline error strings in catalog errors | Caught in 2 separate files by critic | CLAUDE.md rule: `errorResponse(key)` always |
| Startup crash when Redis absent | Crash in local dev environment | CLAUDE.md rule: lazy init, fail-open |
| Redundant JWT validation calls | Performance review of route handlers | CLAUDE.md rule: `getActor()` once, pass as param |
| PII in audit logs | User correction | Lesson captured (pending graduation) |
| Patching wrong file version (Prisma vs Supabase) | Fixes applied to inactive code path | Lesson captured (pending graduation) |
| Stale agent output overwrites current file | Agent output dropped UI sections | Lesson captured (pending graduation) |

---

## Section 7: Coverage Gaps

```
GAP: No CLAUDE.md in src/components/
  Evidence: 12 pending lessons target component patterns (pagination reset,
            CSV export, auth inference, deduplication ref guard) but no
            component-specific CLAUDE.md exists to house them.
  Risk: Component patterns stay in lessons.md and don't reach agents working
        in src/components/.
  Recommendation: Create src/components/CLAUDE.md when 3+ component-specific
                  lessons graduate.

GAP: No guardrail skills created yet
  Evidence: CLAUDE.md mandates guardrail skills after 3+ occurrences of a bug
            class. No skill-trigger-log.md exists. Zero guardrail skills despite
            2 occurrences of "inline error strings" bug.
  Risk: Recurring bugs rely solely on CLAUDE.md rules (passive) rather than
        active guardrail skills that audit during work.
  Recommendation: Monitor for a third occurrence of inline-error-strings;
                  create guardrail skill if it recurs.

GAP: No test suite
  Evidence: No test files found in the project. CLAUDE.md defines testing
            conventions (behavioral tests only) but no tests exist.
  Risk: All runtime gotcha rules are enforced by agent knowledge, not by
        automated tests. A rule violation that agents miss has no safety net.
  Recommendation: Add tests for critical paths (VMS scoring, auth helpers,
                  rate limiting) as the next priority.

GAP: 12 pending lessons with no graduation timeline
  Evidence: All captured on 2026-03-27, none have a second confirming occurrence.
  Risk: Knowledge stays in lessons.md where it's less discoverable than CLAUDE.md.
  Recommendation: Actively look for second occurrences during the next build
                  session; graduate confirmed lessons immediately.

GAP: No autoresearch on installed skills
  Evidence: 10 skills installed, only 2 artifacts autoresearched (hero-copy,
            ai-analysis-prompt). The skills themselves (agent-first, debug,
            spawn, etc.) have never been autoresearched.
  Risk: Skill prompts may have low compliance rates that haven't been measured.
  Recommendation: Run /autoresearch-skills on high-impact skills (agent-first,
                  debug, spawn) to baseline and improve them.
```

---

## Section 8: Metrics

| Metric | Value |
|--------|-------|
| Total commits | 2 |
| Files changed (committed) | 40 |
| Lines added (committed) | 1,862 |
| Lines removed (committed) | 503 |
| CLAUDE.md rules added | 20 (Integration & Runtime Gotchas) + 3 (Code Conventions) |
| Skills installed | 10 |
| Skills autoresearched | 2 |
| Average autoresearch improvement | 58% → 100% (hero-copy) and 61% → 100% (ai-analysis-prompt) |
| Lessons captured | 24 |
| Lessons graduated | 16 |
| Lessons still pending | 12 (8 unique + 4 sub-patterns) |
| Graduation rate | 67% (16/24) |
| Average time to graduate | < 1 day (same session) |
| Cross-session memories | 1 |
| Knowledge events total | ~30 |
| Guardrail skills created | 0 |
| Test files | 0 |
