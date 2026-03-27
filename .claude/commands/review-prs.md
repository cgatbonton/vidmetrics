---
allowed-tools: Bash(gh:*), Bash(git:*), Agent, Skill
description: Poll open PRs and auto-review any that haven't been reviewed yet
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`
- Current open PRs: !`gh pr list --state open --json number,title,isDraft,author,createdAt,headRefName --limit 20`

## Your Task

Review all open pull requests that haven't been reviewed yet by Claude.

### Step 1: Get Open PRs

```bash
gh pr list --state open --json number,title,isDraft,author,createdAt,headRefName,baseRefName,reviews --limit 20
```

### Step 2: Filter PRs That Need Review

For each PR, skip it if ANY of these are true:
- It's a draft (`isDraft: true`)
- Claude has already left a review comment (check `gh pr view <number> --json comments --jq '.comments[].body'` for any comment starting with `## Code review`, case-insensitive)
- The PR was created less than 2 minutes ago (give the author time to finish pushing)
- The PR is a branch-to-branch promotion with no feature content (e.g., merging `development` → `main` as a release) — skip with reason "release promotion PR"

### Step 3: Detect Stacks

Before reviewing, group PRs into stacks so they can be reviewed in the correct order (base first).

**Detection heuristics** (apply in order, first match wins):

1. **Branch prefix pattern** — Branches sharing a common prefix with a numeric segment are a stack. Group by prefix, sort by the numeric segment ascending.
2. **PR body "Stack" reference** — If a PR body contains a line like `Stack: 1/5`, extract the position and group.
3. **Same branch, multiple PRs** — If multiple open PRs share the same `headRefName`, review only the **latest** (highest PR number).
4. **Standalone PRs** — PRs that don't match any pattern are standalone.

**Output a review plan** before starting reviews.

### Step 4: Review Each PR

Review in this order:
1. **Stacked PRs** — Review base-to-tip within each stack
2. **Standalone PRs** — Review in any order after stacks
3. **Skip superseded PRs** — Log as skipped with reason

For each PR that passes the filter:
1. Log which PR you're about to review
2. Invoke the `/code-review` skill with the PR number
3. Wait for the review to complete before moving to the next PR

Review PRs sequentially to avoid rate limiting.

### Step 5: Summary

After all PRs are processed, report:
- Total open PRs found
- Stacks detected
- PRs skipped (with reason)
- PRs reviewed this run
- Any errors encountered

### Notes

- This command can be used with `/loop` for continuous polling
- If no PRs need review, just say "No PRs need review" and stop
- Do not review your own PRs (PRs where the author is the authenticated gh user)
- Respect GitHub API rate limits
