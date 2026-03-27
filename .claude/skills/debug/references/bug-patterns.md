# Known Bug Pattern Library

Use this reference to match observed symptoms against common root causes. Each pattern includes symptoms, verification steps, and typical fixes.

## 1. Race Condition

**Symptoms**: Intermittent failures, works on retry, different results on same input, timing-dependent behavior, "it works on my machine"

**Verification**:
- Add logging with timestamps at suspected interleaving points
- Check for shared mutable state accessed without synchronization
- Look for `await` missing on async calls
- Check if multiple event handlers or effects can fire concurrently
- Search for `setTimeout`/`setInterval` modifying shared state

**Common locations**: Event handlers, useEffect cleanup races, parallel API calls writing to same state, database read-then-write without transactions

**Fix patterns**: Add mutex/lock, use database transactions, serialize with queue, add optimistic locking, ensure proper `await` chains

---

## 2. Nil/Undefined Propagation

**Symptoms**: `TypeError: Cannot read property 'x' of undefined`, `null is not an object`, crash deep in call stack far from actual source

**Verification**:
- Trace the undefined value backwards through the call chain
- Check API response shapes against expected types
- Verify optional chaining covers all nullable paths
- Look for destructuring of potentially undefined objects
- Check if database query returned `null` for expected row

**Common locations**: API response handling, database query results, prop drilling through components, state initialization before data loads

**Fix patterns**: Add null checks at the boundary (where data enters), not deep inside — validate at system edges, trust internal code

---

## 3. Stale Cache / Stale Closure

**Symptoms**: UI shows old data after mutation, function captures old value, "I updated it but nothing changed", works after hard refresh

**Verification**:
- Check React Query `invalidateQueries` calls after mutations
- Look for closures capturing state variables (useCallback/useEffect with stale deps)
- Check if cache keys match between read and invalidation
- Verify Zustand selectors return new references on update
- Look for memoization (`useMemo`, `React.memo`) preventing re-render

**Common locations**: React Query cache after mutations, useEffect/useCallback dependency arrays, Zustand store selectors, service worker caches, CDN caching headers

**Fix patterns**: Invalidate correct cache keys, add missing dependencies to dep arrays, use functional state updates, bust cache with version param

---

## 4. Config Drift

**Symptoms**: Works in dev but not prod (or vice versa), "it was working yesterday", environment-specific failures, different behavior after deploy

**Verification**:
- Diff environment variables between environments
- Check for hardcoded values that should be env vars
- Verify database migration state matches between environments
- Check for feature flags or A/B test differences
- Look for `.env.local` overrides not committed

**Common locations**: Environment variables, database schema differences, API endpoint URLs, feature flags, CORS settings, auth config

**Fix patterns**: Audit env vars across environments, run pending migrations, sync feature flags, add environment validation at startup

---

## 5. Event Handler / Effect Loop

**Symptoms**: Infinite re-renders, exponential API calls, browser tab crashes, "Maximum update depth exceeded"

**Verification**:
- Check useEffect dependency arrays for object/array literals
- Look for state updates inside effects that trigger the same effect
- Check for circular event chains (A updates B, B updates A)
- Verify useCallback/useMemo deps don't include their own output
- Look for Zustand subscriptions triggering state updates

**Common locations**: useEffect with object dependencies, Zustand subscribe + setState loops, React Query refetch triggers, event emitter chains

**Fix patterns**: Stabilize references with useMemo, break circular chains, use functional updates, add guards/flags to prevent re-entry

---

## 6. Type Coercion / Serialization

**Symptoms**: `"1" + 1 === "11"`, ID comparison fails, JSON parse loses precision, date timezone shifts, BigInt truncation

**Verification**:
- Check types at boundaries (API request/response, URL params, form data)
- Look for implicit string-to-number conversions
- Verify JSON serialization of large integers (>2^53)
- Check date handling across timezones
- Look for `==` instead of `===`

**Common locations**: URL query params (always strings), form data, JSON.parse/stringify boundaries, database driver type mapping, API response parsing

**Fix patterns**: Explicit type conversion at boundaries, use strict equality, handle BigInt as strings, normalize dates to UTC

---

## 7. Missing Error Handling

**Symptoms**: Silent failures, "nothing happened", data partially written, inconsistent state after error

**Verification**:
- Check for `.catch(() => {})` swallowing errors
- Look for try/catch that catches but doesn't re-throw or log
- Verify async functions have error handling
- Check if database operations use transactions for multi-step writes
- Look for fire-and-forget calls that should be awaited

**Common locations**: Promise chains without catch, event handlers without try/catch, background jobs, webhook handlers, cleanup functions

**Fix patterns**: Add proper error boundaries, use transactions for atomicity, log errors before swallowing, add retry logic where appropriate

---

## 8. Dependency Version Mismatch

**Symptoms**: Works locally but CI fails, type errors after install, "module not found" intermittently, peer dependency warnings

**Verification**:
- Compare `package-lock.json` between environments
- Check for `^` vs exact versions in `package.json`
- Look for duplicate package versions in `node_modules`
- Verify peer dependency compatibility
- Check if `npm ci` vs `npm install` produces different results

**Common locations**: CI/CD pipelines, new developer onboarding, monorepo hoisting, post-merge dependency resolution

**Fix patterns**: Pin versions, use `npm ci` in CI, resolve peer dependency conflicts, deduplicate with `npm dedupe`
