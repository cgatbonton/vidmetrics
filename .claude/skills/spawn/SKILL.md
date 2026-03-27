---
name: spawn
description: Orchestrate parallel implementation agents with iterative critic review cycles. Use when the user asks to spawn agents, implement a feature with multiple agents in parallel, or invokes /spawn. Handles work decomposition, parallel agent spawning, critic review loops, simplification, and observer steps.
---

# Spawn — Parallel Agent Orchestrator

Decompose implementation tasks into parallel agents, run iterative critic reviews until no gaps remain, then finalize with simplification and observation.

## When to Use

- User invokes `/spawn`
- User asks to "spawn agents" or "parallelize this work"
- A task has 3+ independent implementation units that benefit from parallel execution
- User asks to "implement this with multiple agents"

## Do NOT Use When

- The task is simple enough for a single agent or direct implementation (fewer than 3 files / 1 feature)
- The user wants research or exploration only (use a general-purpose or Explore agent instead)
- The user wants a code review without implementation (use `/code-review`)
- The work is entirely sequential with tight dependencies between every step

## Workflow

### Phase 1: Analyze and Decompose

Before spawning any agents, analyze the task and decide how to split the work.

1. Read the user's request and identify all implementation units
2. Load `references/splitting-strategies.md` and select the best decomposition strategy
3. Check for dependencies between units — tightly coupled work must be sequenced, not parallelized
4. Identify shared types, utilities, or interfaces that multiple agents will need. If shared code must be created first, do it before spawning parallel agents
5. Present the decomposition plan to the user:
   - Number of agents and what each one does
   - Which strategy was chosen and why
   - Any sequential dependencies (e.g., "Agent 1 must finish before Agent 3 starts")

### Phase 2: Spawn Implementation Agents

**CRITICAL: Never create a feature branch or switch branches.** Stay on whichever branch the user is on. Subagents use `isolation: "worktree"` to get their own isolated copy — that's the whole point. The orchestrator applies changes directly to the current branch when worktree agents complete.

Launch all independent agents in parallel using the Agent tool. For each agent:

1. Write a detailed, self-contained prompt that includes:
   - The specific scope of work (files to create/modify, feature to build)
   - Relevant context (existing patterns, related files to read first)
   - Clear deliverables ("create X, modify Y, export Z")
   - Any shared interfaces or types to conform to
2. Use `isolation: "worktree"` when agents modify overlapping areas of the codebase
3. Launch all independent agents in a single message (parallel tool calls)
4. If there are sequential dependencies, wait for prerequisite agents to complete before launching dependent ones

### Phase 2.5: Merge Worktree Changes

After all implementation agents complete, apply their changes to the current branch:

1. For each worktree agent, get the diff: `cd <worktreePath> && git diff HEAD -- <files>`
2. Apply each diff to the main repo: `cd <worktreePath> && git diff HEAD -- <files> | (cd /path/to/main/repo && git apply -)`
3. If diffs conflict, resolve manually
4. Verify all changes are in the working tree with `git diff --name-only HEAD`

**Never `git checkout` or `git merge` a worktree branch.** Worktree agents may not commit their changes — they just edit files. Extract diffs and apply them.

### Phase 3: Critic Review Loop

After all implementation agents complete:

1. Spawn a **critic agent** (general-purpose) with a prompt that includes:
   - The original task requirements
   - A summary of what each implementation agent built
   - Instructions to review ALL changed code for:
     - Missing functionality or incomplete implementation
     - Integration gaps between agents' work (mismatched types, broken imports, missing wiring)
     - Code quality issues (duplicated logic, missing error handling, convention violations)
     - Adherence to project conventions (CLAUDE.md rules, agent-first patterns if applicable)
   - Instructions to produce a numbered list of specific, actionable gaps
2. If the critic finds gaps:
   - Fix all identified issues (directly or by spawning targeted fix agents)
   - Spawn a **new critic agent** to review again (fresh context, no anchoring to previous review)
   - Repeat until the critic finds no gaps
3. If the critic finds no gaps: proceed to Phase 4

**Important**: Each critic review must be a fresh agent — do not reuse the previous critic. Fresh eyes catch what anchored reviewers miss.

### Phase 4: Simplify

After all critic cycles pass with no gaps, invoke the `/simplify` skill. This reviews all changed code for reuse opportunities, quality issues, and efficiency improvements, then fixes any problems found.

This step is mandatory and cannot be skipped.

### Phase 5: Observer

After simplification is complete, spawn the observer agent:

- Use the Agent tool with `subagent_type: "observer"`
- The observer reviews the work, extracts lessons, and updates `tasks/lessons.md` and relevant CLAUDE.md files

This step is mandatory and cannot be skipped. The spawn workflow is not complete until the observer has run.

## Error Handling

| Situation | Action |
|-----------|--------|
| An implementation agent fails | Read the error, fix the issue, re-run that agent only |
| Agents produce conflicting changes | Resolve conflicts manually, then proceed to critic |
| Critic keeps finding the same gap after 2 fix attempts | Stop and re-examine the approach — the gap may indicate an architectural issue, not a code issue |
| Worktree agent has merge conflicts | Resolve conflicts in the worktree branch before proceeding |

## References

- Load `references/splitting-strategies.md` for detailed guidance on how to decompose work into parallel agents, including strategy selection criteria and anti-patterns
