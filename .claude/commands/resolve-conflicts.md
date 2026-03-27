---
allowed-tools: Bash(git:*), Read, Edit, Glob, Grep, Agent
description: Detect and resolve merge conflicts intelligently
---

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status`
- Merge state: !`git status | head -5`

## Your Task

Detect and resolve all merge conflicts in the current working tree.

### Step 1: Detect Conflict State

Check if we're in an active merge/rebase/cherry-pick:
- `git status` will show "Unmerged paths" or "both modified" for conflicts
- If no conflicts exist, inform the user and stop

### Step 2: List All Conflicted Files

```bash
git diff --name-only --diff-filter=U
```

### Step 3: Resolve Each Conflicted File

For each conflicted file, launch a subagent (sonnet, parallel where possible) that:

1. **Reads the full file** including conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
2. **Reads the git log** for both sides to understand intent:
   - `git log --oneline -5 HEAD` (our side)
   - `git log --oneline -5 MERGE_HEAD` (their side, if merge) or check rebase state
3. **Reads surrounding context** — if the file imports from or is imported by other files, check those for API compatibility
4. **Resolves the conflict** by:
   - Keeping both changes when they don't overlap (e.g., two new imports, two new functions)
   - Preferring the semantically correct version when changes conflict
   - Merging logic from both sides when both are needed
   - Preserving all functionality from both branches — never silently drop code
5. **Removes all conflict markers** (`<<<<<<<`, `=======`, `>>>>>>>`) from the file
6. **Returns a one-line summary** of what was resolved and how

### Step 4: Validate Resolutions

After all files are resolved:

1. **Verify no conflict markers remain:**
   ```bash
   git diff --check
   ```
   Also grep for any leftover `<<<<<<<` or `>>>>>>>` markers across resolved files.

2. **Stage all resolved files:**
   ```bash
   git add <resolved-files>
   ```

3. **Run a quick type/lint check** if applicable to the project.

### Step 5: Complete the Merge/Rebase

- If in a **merge**: `git commit --no-edit` (uses the default merge commit message)
- If in a **rebase**: `git rebase --continue`
- If in a **cherry-pick**: `git cherry-pick --continue`

Do NOT complete automatically if validation in Step 4 found unresolved issues — inform the user first.

### Step 6: Summary

Report:
- Number of files with conflicts resolved
- One-line summary per file of what was resolved
- Whether the merge/rebase/cherry-pick was completed successfully
- Any warnings or manual review suggestions

### Resolution Principles

- **Never silently drop changes** — if unsure, keep both and add a TODO comment
- **Prefer the branch being merged in** for new features (they're the newer work)
- **Prefer the base branch** for config/infrastructure changes (they're the stable version)
- **For package lock files**: keep the union of both dependency sets, prefer higher versions
- **For migration files**: keep both migrations in chronological order
- **For test files**: keep all tests from both sides
- **If a conflict is too complex** (e.g., both sides rewrote the same function differently), flag it for manual review instead of guessing
