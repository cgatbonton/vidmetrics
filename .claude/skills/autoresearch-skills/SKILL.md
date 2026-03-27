---
name: autoresearch-skills
description: >
  Auto-improve any Claude skill or command through iterative testing and prompt mutation. Runs a skill
  repeatedly against test inputs, scores output with a yes/no checklist, analyzes failures,
  mutates the skill prompt, and keeps or reverts changes based on score delta. Produces an
  improved skill file, results log, and changelog. Invoke with /autoresearch-skills.
user_invocable: true
---

# Autoresearch Skills — Autonomous Skill/Command Improvement

Iteratively test and improve any Claude skill or command by running it in a loop: execute, score, analyze failures, mutate the prompt, re-score, keep or revert. Based on Andrej Karpathy's autoresearch method adapted for prompt optimization.

## When to Use

- User invokes `/autoresearch-skills`
- User says "improve my X skill", "auto-improve skill", "optimize skill", or "autoresearch skills"
- A skill is producing inconsistent quality and needs tightening

## Do NOT Use When

- The skill doesn't exist yet (use `skill-creator` first)
- The user wants a one-time manual review (use `code-audit` instead)
- The skill is purely mechanical (no quality variance in output)

## Required Inputs

Gather these from the user before starting. If not provided, ask for them:

1. **Target skill** (required): Name of the skill to optimize. Can be a `.claude/skills/*/SKILL.md` OR a `.claude/commands/*.md` — both are valid targets.
2. **Test inputs** (required): 2-4 representative prompts that would invoke the skill
3. **Checklist** (required): 3-6 yes/no quality questions that define "good output"
4. **Max rounds** (optional): How many improvement rounds to run (default: 5, max: 10)

### Helping the User Define Their Checklist

If the user isn't sure what their checklist should be, help them by:

1. Reading the target skill's SKILL.md or command file
2. Identifying the skill's output format and quality dimensions
3. Suggesting 4-5 yes/no questions based on common failure modes
4. Asking: "Do these capture what 'good' looks like for you? Want to add or change any?"

Load `references/checklists.md` for pre-built checklists for known skills.

### Checklist Design for Different Skill Types

| Skill Type | Checklist Focus | Example Questions |
|-----------|----------------|-------------------|
| **Code generation** | Does the output follow specific patterns/tokens/conventions? | "Does it follow the project's design tokens?", "Does it include the required function calls?" |
| **Refactoring/transformation** | Does the plan/output follow the correct process and structure? | "Does it include barrel exports?", "Does it follow extraction order?" |
| **Workflow orchestration** | Does the workflow enforce project-mandatory rules at each phase? | "Does it read CLAUDE.md files?", "Does it run build verification?" |
| **Content generation** | Does the output have the right structure, tone, and constraints? | "Is it under 150 words?", "Does it avoid buzzwords?" |

**Key insight from practice**: Workflow skills need checklists about what the workflow *enforces*, not what it *produces*. A feature-dev skill doesn't produce text to score — it orchestrates a process. Score whether the process includes mandatory gates, reads required files, and prevents anti-patterns.

## Workflow

### Phase 0: Setup

1. Read the target skill file (SKILL.md or command .md)
2. Create a working copy (`.autoresearch.md` suffix or in-place for commands)
3. Create the results directory: `tasks/autoresearch/{skill-name}/`
4. Initialize `results-log.md` and `changelog.md` in that directory
5. Back up the original immediately (`.backup.md`)

### Phase 1: Baseline Score + Adversarial Analysis (COMBINED)

**Critical learning**: Self-generated baseline scores are inflated. When the same model generates output and scores it, scores typically land 90-100% because the model just read the rules and naturally produces compliant output. The real failure rate in production is 30-60% higher.

**Run baseline and adversarial analysis together:**

1. **Baseline (controlled test)**: Use subagents to generate output for each test input, then score adversarially. Record the controlled-test score.

2. **Adversarial analysis (real-world estimate)**: Launch a subagent with this prompt:
   > "Think about what goes WRONG when this skill is used in real conversations — the agent has other context, is building something complex, and attention is divided. For each checklist question, estimate the real-world failure rate and identify: (1) what actually goes wrong, (2) what in the skill prompt is weak/missing, (3) a specific mutation to fix it. Also identify uncovered failure modes not in the checklist."

3. **Use the adversarial analysis to prioritize mutations**, not just the controlled-test failures. A question that passes 100% in controlled tests but has a 65% estimated real-world failure rate still needs hardening.

4. Display both scores to the user:
   ```
   Controlled test: 96% (23/24)
   Estimated real-world: ~60% (adversarial analysis)
   Highest-risk areas: Q5 (65% failure), Q6 (55% failure)
   ```

### Phase 2: Improvement Loop

For each round (1 to max_rounds):

#### Step 1: Failure Analysis

Examine which checklist questions failed most across test inputs. **Prioritize by real-world estimated failure rate** (from adversarial analysis), not just controlled-test failures.

#### Step 2: Prompt Mutation

Make targeted changes to the working copy. Types of mutations:

| Mutation Type | When to Use | Example |
|--------------|-------------|---------|
| **Add explicit rule** | A checklist item fails because the skill doesn't mention it | Add "Your headline MUST include a specific number or metric" |
| **Add banned list** | Output contains recurring unwanted patterns | Add "NEVER use these words: revolutionary, cutting-edge, synergy" |
| **Add worked example** | Skill produces structurally wrong output | Add a before/after example showing the correct pattern |
| **Tighten constraint** | Output is vague or bloated | Change "keep it concise" to "maximum 120 words" |
| **Loosen constraint** | A previous tightening hurt other checklist items | Revert word count from 100 to 150 if CTA quality dropped |
| **Reorder priorities** | Important rules are buried | Move the most-failed rule to the top of its section |
| **Add concrete stub/implementation** | Skill references a function/pattern but never defines it | Add actual code for `getConstraints()` instead of just naming it |
| **Add absent-thing detection** | Skill can't catch what's *missing* from output | Add "If X is present but Y is not, flag it" |
| **Add pre-flight/post-flight check** | Skill has no self-audit step | Add a mandatory scan before outputting |
| **Full rewrite** | Baseline below 30% — skill is structurally broken | Rewrite all phases while preserving the good parts (e.g., user gates) |

**When to batch vs. single-mutation**:
- Baseline >= 60%: One mutation per round (isolate the variable)
- Baseline 30-60%: Up to 3 related mutations per round (fix one category at a time)
- Baseline < 30%: Full rewrite is more efficient than incremental rounds. Apply all mutations at once and score the result.

Rules for mutations:
- Change must target the highest real-world-failure checklist question
- Preserve the skill's existing structure and voice
- Never delete existing rules that are passing — only add, refine, or reorder
- **Add concrete implementations, not just instructions.** "Always include constraints" fails. A concrete stub function with code succeeds.

#### Step 3: Re-Score

Run ALL test inputs again with the mutated skill. Score identically to Phase 1.

#### Step 4: Keep or Revert

```
if new_score >= previous_score:
    KEEP the mutation
    Log: "Round N: KEPT — [description of change]. Score: X% → Y%"
else:
    REVERT the mutation (restore previous version)
    Log: "Round N: REVERTED — [description of change]. Score: X% → Y% (regression)"
```

#### Step 5: Record Results

Update `results-log.md` and `changelog.md` with per-round scores and mutation details.

#### Step 6: Early Exit

Stop the loop if ANY of these conditions are met:
- Score reaches 95%+ for 2 consecutive rounds
- All checklist questions pass on all test inputs (100%)
- Max rounds reached
- 3 consecutive reverts (the skill may be at its ceiling)

### Phase 3: Finalize

1. Save the improved skill
2. Generate `tasks/autoresearch/{skill-name}/summary.md` with: date, rounds, score progression, changes made, estimated real-world improvement, recommendation
3. Ask the user: "The improved skill scored YY% (up from XX%). Want me to replace the original with the improved version, or review the changes first?"

### Phase 4: Apply (if user approves)

1. Back up original to `.backup.md` (if not already done in Phase 0)
2. Replace original with improved version
3. Clean up working copy
4. Confirm: "Original backed up. Improved version is now active."

## Scoring Protocol

Scoring must be consistent and objective. For each checklist question:

- **Pass (1)**: The answer to the yes/no question is clearly YES based on the output
- **Fail (0)**: The answer is NO, ambiguous, or the relevant element is missing
- **No partial credit**: Binary only. If it's "mostly" there, it fails.

When scoring your own output, be adversarial. Look for reasons to fail, not reasons to pass.

### Self-Scoring Bias (CRITICAL)

**The biggest limitation of autoresearch is self-scoring bias.** When the same model generates output and grades it, scores are inflated because:
1. The generator just read the rules and naturally produces compliant output
2. The scorer rationalizes borderline cases as passing
3. Real-world failures (divided attention, messy context, large files) don't surface in controlled tests

**Countermeasures** (apply all of these):
- Run adversarial analysis alongside baseline — don't trust controlled scores alone
- Use subagents for generation (they have less context about the rules being tested)
- When scoring, re-read the checklist question literally — don't let familiarity with the skill drift the interpretation
- If unsure whether something passes, it fails
- **Focus mutations on real-world failure modes** identified by adversarial analysis, even when controlled tests pass at 100%

## Patterns Discovered in Practice

These patterns emerged from autoresearching various skills across different projects:

### 1. Missing implementations are worse than missing rules
Skills that reference functions/patterns without defining them (e.g., "call getConstraints()" without showing what it returns) fail at much higher rates than skills that simply don't mention a concept. **Always provide a concrete stub**, even if it's minimal.

### 2. Workflow skills need project-awareness injection
Generic workflow templates (feature-dev, code-review) had the lowest baselines (17%, 61%) because they had zero awareness of project-mandatory rules. The fix is always the same: inject CLAUDE.md reading, anti-pattern checklists, and mandatory-rule gates into the workflow phases.

### 3. Absent-thing detection is the #1 blind spot
Skills that review or validate output consistently fail to detect what's *missing* — a route without API_REGISTRY.md update, a schema change without a migration file, a component plan without barrel exports. These require explicit "if X is present but Y is not, flag it" rules.

### 4. Pre-flight/post-flight checks are the highest-ROI mutation
Adding a mandatory self-scan step (before outputting for generation skills, after execution for workflow skills) catches failures that slip through all other rules. This single mutation type improved every skill it was applied to.

### 5. The plan template IS the output
For skills that produce plans (component-refactoring), the template example in the skill determines what gets included. If barrel exports aren't in the template, they won't be in any generated plan. **The template is the most important part of a planning skill.**

### 6. Enumerated checklists beat prose rules
"Follow project conventions" fails. An enumerated list of the 6 specific anti-patterns to check succeeds. Always convert prose rules into numbered checklists when the skill needs to enforce compliance.

## File Structure

```
.claude/skills/{skill-name}/
├── SKILL.md                    # Original (or improved after apply)
├── SKILL.autoresearch.md       # Working copy during optimization
├── SKILL.backup.md             # Backup of original (after apply)

# OR for commands:
.claude/commands/
├── {command-name}.md           # Original (or improved after apply)
├── {command-name}.backup.md    # Backup of original

tasks/autoresearch/{skill-name}/
├── results-log.md              # Per-round scores and breakdowns
├── changelog.md                # Every mutation attempted with diffs
├── summary.md                  # Final summary report
```

## Error Handling

| Error | Recovery |
|-------|----------|
| Skill not found | Check both `.claude/skills/` and `.claude/commands/`. List available options. |
| No test inputs provided | Suggest 2-3 based on the skill's "Example Prompts" section or its description |
| Checklist too vague | Help user sharpen questions to strict yes/no |
| Score doesn't improve after 3 rounds | Stop, report ceiling, suggest restructuring the skill |
| Skill output is non-textual (code) | Score the code against checklist (e.g., "Does it use X pattern?") |
| Baseline below 30% | Skip incremental rounds — do a full rewrite, score the result |
| Skill is a workflow (no single output) | Score what the workflow *enforces*, not what it *produces* |

## Important Notes

- The working copy is never the live skill — the original is untouched until the user explicitly approves
- The changelog is the most valuable artifact — it documents what works and what doesn't for that specific skill
- Run this with enough test inputs (3-4 minimum) to avoid overfitting to a single case
- Mutations should be additive — avoid removing existing passing rules
- **Adversarial analysis is not optional** — it's the difference between a 96% controlled score and catching the real 40% failure rate
- Commands (`.claude/commands/*.md`) are valid targets, not just SKILL.md files
- Back up originals BEFORE making any changes, not after
