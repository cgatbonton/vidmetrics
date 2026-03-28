# Lessons Log

Knowledge captured from agent work sessions. Lessons graduate to CLAUDE.md files when validated.

## Pending Lessons

### Audit logs and events must never include PII
- **Date**: 2026-03-27
- **Source**: correction
- **Target**: `CLAUDE.md`
- **Status**: captured
- **Lesson**: The register route was logging the user's email in the audit `outcome` field and the event `data` field. PII leakage through structured logging is easy to miss because the audit/event helpers look harmless — the risk is in what callers pass to them.
- **Rule**: Never include PII (email, phone, name) in `auditLog` `outcome` or `emitEvent` `data` fields. Use opaque IDs only.

### Use `errorResponse(key)` for catalog errors, not `createErrorResponse()`
- **Date**: 2026-03-27
- **Source**: correction
- **Target**: `CLAUDE.md`
- **Status**: captured
- **Lesson**: The register route used `createErrorResponse()` inline for the EMAIL_TAKEN case even though that code existed in the ERRORS catalog. The critic had to catch this. `createErrorResponse()` bypasses the catalog and allows strings to drift out of sync.
- **Rule**: When the error code exists in the ERRORS catalog in `src/lib/errors.ts`, always call `errorResponse(key)`. Reserve `createErrorResponse()` for one-off errors with no catalog entry.

### `getUser()` not `getSession()` for auth validation in client context
- **Date**: 2026-03-27
- **Source**: discovery
- **Target**: `CLAUDE.md`
- **Status**: graduated
- **Lesson**: The auth context was using `getSession()` to initialize auth state. `getSession()` reads from local storage without validating the JWT with the Supabase server — a tampered or expired token passes. `getUser()` performs server-side JWT validation. The fix: call `getUser()` first to validate, then call `getSession()` to populate the session object for consumers.
- **Rule**: Always use `getUser()` to validate the Supabase session in auth helpers and context providers. Never use `getSession()` alone for trusted auth checks — it reads unvalidated local storage.

### `.env.example` for committed placeholder files, not `.env`
- **Date**: 2026-03-27
- **Source**: discovery
- **Target**: `CLAUDE.md`
- **Status**: captured
- **Lesson**: `.gitignore` uses a `.env*` glob pattern which matches `.env` itself — it cannot be committed. Using `.env` as the committed placeholder file for onboarding is silently swallowed by `.gitignore`. `.env.example` escapes the glob and can be committed safely.
- **Rule**: Committed placeholder/template env files must be named `.env.example`. Never use `.env` as a committed file — it is matched by the `.env*` gitignore glob.

### Verify which route version exists before applying fixes
- **Date**: 2026-03-27
- **Source**: correction
- **Target**: `CLAUDE.md`
- **Status**: captured
- **Lesson**: The register route had a Prisma-based version co-existing with a Supabase-based version. Security fixes were applied to the Prisma version; the Supabase version (the one actually in use) was left untouched. No error surfaces — the wrong file is valid code.
- **Rule**: Before patching any route or service, grep for all files at that path pattern and confirm which implementation is active (imported, wired, referenced). Never assume the first file found is the one in use.

### Git worktree checkout wipes untracked files in that path
- **Date**: 2026-03-27
- **Source**: bug
- **Target**: `CLAUDE.md`
- **Status**: graduated
- **Lesson**: During parallel agent work with git worktrees, checking out an external branch into a worktree path that contained uncommitted new files wiped those files — they were untracked and not protected by git. Files had to be manually restored from agent output.
- **Rule**: Before checking out any branch into a worktree or running `git checkout` on a directory, confirm there are no untracked/unstaged files in that path with `git status`. Uncommitted new files are destroyed by checkout with no recovery path.

### `VmsVideoInput.duration` must always be ISO 8601, never pre-formatted
- **Date**: 2026-03-27
- **Source**: discovery
- **Target**: `CLAUDE.md`
- **Status**: graduated
- **Lesson**: `computeVmsScores` in `src/lib/metrics.ts` calls `formatDuration(video.duration)` internally, expecting the raw ISO 8601 string (e.g. "PT12M34S"). If a caller pre-formats the duration to a human-readable string (e.g. "12:34") before passing it to `VmsVideoInput`, `formatDuration` will silently mangle the output because the regex won't match. The double-format bug was caught by a critic review.
- **Rule**: The `duration` field on `VmsVideoInput` must always be the raw ISO 8601 duration string. `computeVmsScores` owns the formatting step. Never pre-format duration before passing it into the VMS scorer.

### Parallelizable API fetches must use `Promise.all`, not sequential awaits
- **Date**: 2026-03-27
- **Source**: correction
- **Target**: `CLAUDE.md`
- **Status**: graduated
- **Lesson**: The initial channel analysis route fetched `fetchChannelWithAvatar` and `fetchRecentVideos` with sequential `await` calls. These are independent — the channel data doesn't depend on the video list. A critic review caught this. The fix was `Promise.all([fetchChannelWithAvatar, fetchRecentVideos])`, cutting latency roughly in half for this pair.
- **Rule**: When two or more async fetches have no data dependency between them, always run them with `Promise.all`. Sequential `await` on independent calls is a performance bug.


### Modals using `createPortal` require both `mounted` guard and `AnimatePresence` for exit
- **Date**: 2026-03-27
- **Source**: discovery
- **Target**: `CLAUDE.md`
- **Status**: graduated
- **Lesson**: The Modal component required two non-obvious patterns to work correctly: (1) a `mounted` state guard to avoid SSR crashes from `document.body` being undefined, and (2) wrapping with `AnimatePresence` so that `exit` animation variants on the `motion.div` actually fire on close. Without `AnimatePresence`, the exit animation is skipped entirely — the element unmounts immediately. The critic caught the missing exit animation.
- **Rule**: Every modal using `createPortal` must include both the `mounted` SSR guard (see SSR Guard rule in CLAUDE.md) and wrap its content in `AnimatePresence`. `exit` props on `motion` elements only work when wrapped in `AnimatePresence`.

### Reset pagination when any filter changes
- **Date**: 2026-03-27
- **Source**: discovery
- **Target**: `CLAUDE.md`
- **Status**: captured
- **Lesson**: VideoGrid tracks `visibleCount` for "load more" pagination independently from filter state. When a filter narrows results, `visibleCount` is stale — it can be larger than the new filtered set, causing the "Load More" button to disappear even though the user just filtered. The fix: reset `visibleCount` to `PAGE_SIZE` in every filter handler, not in `useMemo`.
- **Rule**: When a component has independent pagination state (`visibleCount`) and filter state, every filter change handler must reset `visibleCount` to `PAGE_SIZE`. Never rely on `useMemo` to fix stale pagination — it recalculates the slice but doesn't reset the count.

### CSV export must reference the filtered list, not the raw input
- **Date**: 2026-03-27
- **Source**: discovery
- **Target**: `CLAUDE.md`
- **Status**: captured
- **Lesson**: VideoGrid passes `filteredAndSorted` (the current view after all filters and sort) to `downloadCsv`, not the raw `videos` prop. Passing the raw array would silently export data the user can't see and bypass their active filter state.
- **Rule**: Any export action (CSV, copy, share) must operate on the derived/filtered data that represents the user's current view, not the unfiltered source array. The user's expectation is "export what I'm looking at."

### `getSession()` preferred over `getUser()` when only user ID is needed
- **Date**: 2026-03-27
- **Source**: discovery
- **Target**: `CLAUDE.md`
- **Status**: captured
- **Lesson**: The logout route uses `getSession()` instead of `getUser()` to retrieve the user ID. `getUser()` makes a network call to Supabase to validate the JWT; `getSession()` reads the session cookie locally with no network round-trip. When a route only needs to identify who is logging out (not to validate their access to a resource), the network call is waste and adds latency.
- **Rule**: Use `getSession()` when you only need the user ID from an already-established server session (e.g., to attribute an audit log on logout). Use `getUser()` when you need to verify the token is valid before granting access to a resource. These are complementary, not competing — the distinction is validation need, not security.

### Supabase server `signOut()` requires client reload to sync browser auth state
- **Date**: 2026-03-27
- **Source**: discovery
- **Target**: `CLAUDE.md`
- **Status**: captured
- **Lesson**: Calling `supabase.auth.signOut()` on the server side clears the server-side session cookies, but the browser's in-memory auth state (held by the Supabase client and React auth context) is not notified. The client continues to render as authenticated until a full page reload forces re-hydration of auth state from the now-cleared cookies.
- **Rule**: After a server-side Supabase `signOut()`, the client must call `window.location.reload()` (or redirect) to sync browser auth state. Optimistic client-side state updates alone are insufficient — the auth context re-initializes from cookies only on mount.

### Agent diff output must be validated against current file state before applying
- **Date**: 2026-03-27
- **Source**: correction
- **Target**: `CLAUDE.md`
- **Status**: captured
- **Lesson**: A subagent produced complete file rewrites that omitted UI sections present in the current file (AuthForm lost confirmation UI, Hero lost authMode state). The agent's output was based on a snapshot of the file at task-start; uncommitted changes in the working tree meant the agent's reference was stale by the time its output was applied. The orchestrator had to manually diff agent output against current file state and restore dropped sections.
- **Rule**: Before applying any agent-produced file rewrite (not just a targeted Edit), diff the agent output against the current file state (`git diff` or manual inspection). Verify that no existing UI sections, state variables, or logic branches have been silently dropped. A rewrite that passes tests but removes features is a regression.

### Stale audit results must be reconciled against current codebase before patching
- **Date**: 2026-03-27
- **Source**: correction
- **Target**: `CLAUDE.md`
- **Status**: captured
- **Lesson**: An agent-first audit flagged `useSavedChannels` as missing structured errors. By the time the fix was applied, the hook had already been updated by a parallel change. Applying the patch a second time caused a merge conflict and a redundant rewrite that had to be reverted.
- **Rule**: Before applying any fix identified by an audit, read the current state of the target file. If the violation is already resolved, skip the patch. Never treat audit findings as unconditionally applicable — they describe a snapshot, not the live state.

## Ready to Graduate

<!-- Lessons confirmed by a second occurrence or successful application move here -->

## Graduated

### Git worktree checkout wipes untracked files in that path
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Integration & Runtime Gotchas

### `VmsVideoInput.duration` must always be ISO 8601, never pre-formatted
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Integration & Runtime Gotchas

### Parallelizable API fetches must use `Promise.all`, not sequential awaits
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Integration & Runtime Gotchas

### Modals using `createPortal` require both `mounted` guard and `AnimatePresence` for exit
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Integration & Runtime Gotchas

### Shared type defined once in the deepest consuming module
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Code Conventions > Type Ownership. Confirmed by second occurrence: `LabeledVideo` used from `src/types/analysis.ts` instead of defining `LabeledScoredVideo` in VideoGrid.

### `getUser()` not `getSession()` for auth validation in client context
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Integration & Runtime Gotchas. Confirmed by application: logout route correctly used `getSession()` (not `getUser()`) in this session, demonstrating the rule was understood and applied.

### Use `localStorage` not `sessionStorage` for cross-tab signaling
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Integration & Runtime Gotchas

### Server-side pending row is the correct pattern for pre-auth saves
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Integration & Runtime Gotchas

### Supabase `SIGNED_IN` fires in every tab — use it for cross-tab triggers
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Integration & Runtime Gotchas

### Validate client-supplied JSONB blobs at the route boundary, not the DB layer
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Integration & Runtime Gotchas

### RLS for pre-auth insert: `WITH CHECK (true)` + email subquery for read/delete
- **Graduated**: 2026-03-27 — added to root `CLAUDE.md` under Integration & Runtime Gotchas
