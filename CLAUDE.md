# CLAUDE.md — [Project Name]

## Project Overview

<!-- Fill in: What this project does, who it's for -->

## Tech Stack

<!-- Fill in: Framework, language, database, styling, deployment, etc. -->

## Project Structure

<!-- Fill in: Directory tree with descriptions -->

## Key Commands

<!-- Fill in: dev, build, lint, test commands -->

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

<!-- Fill in: Project-specific naming conventions -->

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

<!--
Add entries here as CLAUDE.md files are created in subdirectories:

| Directory | CLAUDE.md Path |
|-----------|---------------|
| `src/api/` | `src/api/CLAUDE.md` |
| `src/components/` | `src/components/CLAUDE.md` |
| Agent-First patterns | `.claude/skills/agent-first/` |
-->

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
