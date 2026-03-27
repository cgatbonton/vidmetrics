---
allowed-tools: Bash(codex:*), Read, Glob, Grep, Agent
description: Adversarial code review using Codex (or Claude fallback) — hostile staff-engineer reviewer reaching consensus through debate
argument-hint: File paths or architecture topic to review
---

# Codex Adversarial Code Review

Use OpenAI Codex CLI as a hostile staff-engineer reviewer. Claude and Codex collaborate through adversarial debate until they reach consensus on a final recommendation.

## Input

$ARGUMENTS

## Step 1: Gather Context

1. **Detect file paths** in the input above. Look for any path containing `/` with a file extension, or directory prefixes.
2. **If file paths found**: Read each file using the Read tool. For each file, also check if a CLAUDE.md exists in that directory or its parent — read it too for domain rules.
3. **If no file paths found** (architecture decision, design review): Read the root CLAUDE.md and any architecture documentation. Then use Grep to find files related to the topic and read the top 2-3 most relevant files.
4. **Collect all project rules**: Read every CLAUDE.md file found and extract all explicit rules, conventions, and anti-patterns. These become the PROJECT RULES for the Codex prompt.
5. **Adapt the output format** to the review type:
   - **Code review**: Use `file:line` references and a Project Rule Violations checklist
   - **Architecture review**: Replace `file:line` with `Decision`, `Trade-off`, `Risk`

## Step 2: Construct Review Prompt

Build the Codex prompt with this structure:

```
You are a hostile staff engineer reviewing code for a [detect project type from CLAUDE.md/package.json].

PROJECT RULES (violations are HIGH severity):
[Insert all rules extracted from CLAUDE.md files in Step 1]

CODE TO REVIEW:
[paste gathered code here with filenames as headers]

REVIEW INSTRUCTIONS:
1. Only report issues anchored to specific line numbers or code patterns — no generic advice
2. For each issue, categorize as CRITICAL / HIGH / MEDIUM / LOW
3. Provide a concrete fix (code snippet) for each issue
4. Check explicitly for MISSING things: missing error handling, missing validation, missing cleanup, missing documentation updates
```

## Step 3: Run Codex

**IMPORTANT: ONLY use `gpt-5.4` as the model. Never use any other model.**

```bash
codex exec -m gpt-5.4 -s read-only "<constructed prompt>"
```

**If Codex CLI is not available** (command not found error): Fall back to spawning a subagent with the same prompt as a native Claude review. Tell the user: "Codex CLI not available — running native Claude review instead."

## Step 4: Format Codex Output

Present the Codex output (or native fallback output) in this format:

### For code reviews:

## Issues Found
- [CRITICAL/HIGH/MEDIUM/LOW] Description with file:line reference
  - **Fix**: concrete code change

## Project Rule Violations
[Dynamic checklist based on rules extracted from CLAUDE.md]

## Risk Level
Overall: CRITICAL / HIGH / MEDIUM / LOW

## Recommended Changes
Prioritized list of fixes, most critical first.

### For architecture reviews:

## Issues Found
- [CRITICAL/HIGH/MEDIUM/LOW] Description of concern
  - **Trade-off**: what you gain vs. what you lose
  - **Alternative**: concrete alternative approach

## Architecture Checklist
[Dynamic checklist based on project constraints]

## Risk Level
Overall: CRITICAL / HIGH / MEDIUM / LOW

## Recommended Changes
Prioritized list, most critical first.

## Step 5: Claude Responds to Codex

After presenting Codex's findings, Claude must respond to each issue:

For each Codex finding, state one of:
- **AGREE** — the issue is valid, incorporate it into the plan
- **PARTIALLY AGREE** — the concern is real but the severity or fix is wrong. Explain why and propose a better fix.
- **DISAGREE** — the issue is incorrect, theoretical, or irrelevant given actual project constraints. Provide concrete evidence.

Structure the response as a table:

| # | Codex Finding | Claude Verdict | Reasoning |
|---|---|---|---|
| 1 | ... | AGREE / PARTIALLY AGREE / DISAGREE | ... |

## Step 6: Send Rebuttals Back to Codex

Take all PARTIALLY AGREE and DISAGREE items and send them back to Codex:

```bash
codex exec -m gpt-5.4 -s read-only "<rebuttal prompt>"
```

The rebuttal prompt should include:
- The original finding
- Claude's counterargument with evidence
- Ask Codex to either **CONCEDE** (drop the issue), **REVISE** (adjust severity/fix), or **HOLD** (maintain position with new evidence)

## Step 7: Reach Consensus

After the rebuttal round:
1. **Agreed items** (both sides agree): These go into the final recommendation
2. **Conceded items** (Codex dropped): Mark as resolved
3. **Revised items** (Codex adjusted): Use the revised version
4. **Held items** (still disagreed): Present both positions to the user and let them decide

Present the final consensus as:

## Consensus Recommendation

### Agreed Changes (both Claude and Codex agree)
Numbered list of changes to make, with severity and concrete fix.

### Unresolved Disagreements (user decides)
For each held item:
- **Codex position**: ...
- **Claude position**: ...
- **User action needed**: Choose one approach

### Updated Plan
If reviewing a plan file: list the specific amendments. If reviewing code: list the specific code changes.
