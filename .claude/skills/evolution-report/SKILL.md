---
name: evolution-report
description: >
  Generate a report summarizing how the agentic codebase has evolved over a user-defined period.
  Surfaces critical insights learned, skill improvements, CLAUDE.md mutations, lesson graduations,
  and patterns that changed how agents build code. Shows the self-improvement trajectory of the
  codebase. Invoke with /evolution-report.
user_invocable: true
---

# Evolution Report — Agentic Codebase Intelligence

Generate a structured report showing how the codebase's agentic intelligence has evolved over a specified time period. This is a meta-skill: it doesn't build features — it measures how effectively agents learn to build them.

## When to Use

- User invokes `/evolution-report`
- User says "show me what's changed", "how have agents improved", "what did we learn"
- End of a sprint/milestone to review agentic progress
- Before starting a new initiative to baseline current knowledge

## Required Input

**Time period** (required): The user must specify a period. Examples:
- "last 2 weeks"
- "since March 1"
- "February to March"
- "last 30 days"

Convert relative dates to absolute dates using today's date before querying.

## Data Sources

The report is built by scanning these sources — read ALL of them:

| Source | What It Contains | How to Query |
|--------|-----------------|-------------|
| `git log` | Commits, what was built, when | `git log --oneline --since=<start> --until=<end>` |
| `git log -- '**/CLAUDE.md'` | CLAUDE.md mutations (rules added/changed) | `git log --oneline --since=<start> -- '**/CLAUDE.md'` |
| `tasks/lessons.md` | Pending, validated, and graduated lessons | Read file, filter by date |
| `tasks/autoresearch/*/summary.md` | Skill improvement results (baseline → final scores) | Read all summary files, filter by date |
| `tasks/autoresearch/*/changelog.md` | Specific mutations that improved skills | Read for detail on key improvements |
| MEMORY.md (auto-memory) | Cross-session learnings | Read `~/.claude/projects/.../memory/MEMORY.md` |
| `.claude/skills/*/SKILL.md` | Current skill definitions | `git log --since=<start> -- '.claude/skills/'` |
| `.claude/commands/*.md` | Current command definitions | `git log --since=<start> -- '.claude/commands/'` |

## Report Structure

Generate the report in this exact structure:

### Section 1: Executive Summary (3-5 sentences)

One paragraph answering: Over this period, how much smarter did agents get at building in this codebase? Quantify where possible (skills improved, lessons graduated, rules added).

### Section 2: Knowledge Growth Timeline

Chronological list of knowledge-changing events:

```
[DATE] [TYPE] Description
───────────────────────────────────
2026-02-27  SKILL    new-skill created — agents can now handle [specific task]
2026-02-27  RULE     src/database/CLAUDE.md — added "never use unsafe migration command" after production incident
2026-03-01  LESSON   API response field encoding issue graduated to src/integrations/CLAUDE.md
2026-03-15  MEMORY   third-party API date format gotcha captured after 3rd occurrence
2026-03-20  SKILL    database-migration autoresearched 85% → 100% — 5 mutations kept
```

**Event types:**
- `SKILL` — Skill created, updated, or autoresearched
- `RULE` — CLAUDE.md rule added or modified
- `LESSON` — Lesson captured, validated, or graduated
- `MEMORY` — Cross-session memory saved
- `PATTERN` — New architectural pattern established
- `GOTCHA` — New gotcha/footgun documented

### Section 3: Skill Evolution

For each skill that was created or improved in the period:

```
SKILL: database-migration
  Created: 2026-03-20
  Autoresearched: 85% → 100% (5 rounds, 5 kept, 0 reverted)
  Key mutations:
    - Added relations file update step (closed 55% real-world failure gap)
    - Fixed entity naming convention (schema inconsistency acknowledged)
    - Added row-level security policy example (prevented raw SQL fallback)
  Impact: Agents now correctly use the ORM for ALL schema changes including security policies
```

### Section 4: CLAUDE.md Mutations

List every CLAUDE.md change in the period with the rule that was added/changed and why:

```
FILE: src/database/CLAUDE.md
  + "Never use unsafe push command — bypasses migration files, can silently drop columns"
  + "Two migration systems exist — never confuse ORM migrations with raw SQL migrations"
  WHY: Agent placed a security fix in the wrong migration directory — it was silently ignored

FILE: src/integrations/CLAUDE.md
  + "API field must be correct JSON type, not string — use manual JSON construction"
  WHY: Serializer produces string type, API rejects it. Type casting loses precision.
```

### Section 5: Lessons Lifecycle

Track the flow of knowledge from incident → lesson → graduated rule:

```
GRADUATED (incorporated into permanent docs):
  - "Third-party click ID: internal type uses one name, DB column uses another"
    → Graduated to src/integrations/CLAUDE.md (2026-03-20)

PENDING (captured but not yet graduated):
  - "Test mock builder must mirror every filter method used in production"
    → Target: test file note (2026-03-19)
  - "UI component: gate display stats on hasData, not hasRealOverlap"
    → Target: src/components/CLAUDE.md (2026-03-19)

PATTERN: Lessons take ~1-3 sessions to graduate. Fast graduation = high confidence.
         Slow graduation = may be a one-off, needs more evidence.
```

### Section 6: Agent Failure Modes Addressed

What types of mistakes did agents STOP making because of knowledge added this period?

| Failure Mode | How It Was Caught | What Prevents It Now |
|-------------|------------------|---------------------|
| Wrong migration system | Agent put security policy in wrong directory | database-migration skill + src/database/CLAUDE.md rule |
| Missing required fields | Agent copied schema from wrong template table | database-migration skill: "copy from correct template" |
| API field type mismatch | Type casting precision loss on large IDs | src/integrations/CLAUDE.md + integration-debug gotcha |
| Infinite state update loops | State dependency chains not traced | state-safety skill with circular detection |

### Section 7: Coverage Gaps (What's Still Missing)

Identify areas where agents are likely to still make mistakes:

```
GAP: No skill for [specific area]
  Evidence: [how you know this is a gap — recent incident, missing CLAUDE.md, etc.]
  Risk: [what goes wrong without it]
  Recommendation: [create skill / add CLAUDE.md rule / capture lesson]
```

### Section 8: Metrics

| Metric | Value |
|--------|-------|
| Total commits in period | N |
| CLAUDE.md files modified | N |
| Skills created | N |
| Skills autoresearched | N |
| Lessons captured | N |
| Lessons graduated | N |
| Lessons still pending | N |
| Average autoresearch improvement | X% → Y% |
| Knowledge events per week | N |

## Execution

### Step 1: Gather Data (Parallel)

Launch these queries in parallel:

```bash
# All commits in period
git log --oneline --since="<start>" --until="<end>"

# CLAUDE.md changes
git log --oneline --since="<start>" -- '**/CLAUDE.md'

# Skill changes
git log --oneline --since="<start>" -- '.claude/skills/' '.claude/commands/'

# Count stats
git log --since="<start>" --until="<end>" --format="%H" | wc -l
```

Read in parallel:
- `tasks/lessons.md`
- All `tasks/autoresearch/*/summary.md` files
- MEMORY.md

### Step 2: Analyze & Correlate

For each knowledge event, trace the chain:
- What incident/discovery triggered it?
- What permanent artifact was created (rule, skill, memory)?
- What failure mode does it prevent?

### Step 3: Generate Report

Write the report to `tasks/autoresearch/evolution-reports/evolution-report-<date>.md` and display it to the user.

### Step 4: Identify Gaps

After generating the report, scan for:
- Directories with no CLAUDE.md that have had bugs in the period
- Repeated mistakes in git history that have no corresponding rule
- Skills that haven't been autoresearched
- Lessons pending for > 2 weeks without graduation

## Report Quality Rules

- **Quantify everything** — "5 skills improved" not "several skills improved"
- **Show the chain** — incident → lesson → rule → prevention
- **Be specific** — name files, functions, and exact rules, not categories
- **Focus on impact** — what mistakes are agents NO LONGER making?
- **Acknowledge gaps** — the most valuable part is what's still missing
- **Date everything** — every event needs a date for the timeline

## Error Handling

| Error | Recovery |
|-------|----------|
| No commits in period | Widen the period or report "no activity" |
| No autoresearch summaries | Report "no skills were autoresearched in this period" |
| lessons.md doesn't exist | Report "no lesson tracking active" |
| MEMORY.md not found | Skip memory section, note it in gaps |
