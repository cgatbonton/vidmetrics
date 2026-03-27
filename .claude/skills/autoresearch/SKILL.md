---
name: autoresearch
description: >
  Optimize any code artifact (prompts, constants, thresholds, scoring algorithms) through iterative
  mutation and binary scoring. Edits the artifact, runs an eval, scores against a checklist, keeps
  improvements, reverts regressions. Works on any file with measurable output — not limited to skills.
  Invoke with /autoresearch. For skill/command prompt optimization, use /autoresearch-skills instead.
user_invocable: true
---

# Autoresearch — Autonomous Artifact Optimization

Iteratively improve any code artifact by running it in a loop: edit, evaluate, score, keep or revert. Based on Andrej Karpathy's autoresearch method. This is the general-purpose version — it works on any file with measurable output (prompts, constants, thresholds, scoring algorithms, config).

For optimizing Claude skills and commands specifically, use `/autoresearch-skills` instead.

## When to Use

- User invokes `/autoresearch`
- User says "optimize", "tune", "autoresearch", or "improve performance of"
- A prompt, config, or algorithm has tunable parameters and a measurable outcome
- Triggered conditionally by `/feature-dev` Phase 5.5, `/code-review` post-review, or `/skill-creator` Step 7

## Do NOT Use When

- The target is a Claude skill or command file (use `/autoresearch-skills`)
- There's no measurable metric (pure subjective quality with no binary criteria)
- The artifact is user-editable config that shouldn't be baked in
- It's a one-off fix, not iterative optimization

## Artifact Types

| Type | Examples | Metric | Eval Method |
|------|----------|--------|-------------|
| **LLM Prompt** | System prompts, generation templates, analysis rubrics | Checklist pass rate | LLM judge scores output against binary criteria |
| **Constants/Thresholds** | Similarity thresholds, batch sizes, timeouts, weights | Performance metric | Run eval script, measure throughput/accuracy/latency |
| **Scoring Algorithm** | Match scoring, attribution credit, variance detection | Accuracy (F1, precision/recall) | Run against labeled dataset |
| **Config Parameters** | Poll intervals, retry delays, concurrency limits | Composite score | Run eval harness, measure combined metric |

## Required Inputs

Gather these from the user before starting:

1. **Target file** (required): The file containing the artifact to optimize
2. **What to measure** (required): The metric that defines "better" (e.g., pass rate, records/sec, F1 score)
3. **Eval method** (required): How to measure — one of:
   - **LLM judge**: Generate output, score against binary checklist (for prompts)
   - **Eval script**: Run the eval script and extract metric (for code)
   - **Test suite**: Run existing tests and check pass rate (for algorithms)
4. **Scoring criteria** (required for LLM judge): 3-6 binary (yes/no) questions
5. **Test inputs** (required for LLM judge): 2-4 representative inputs
6. **Max rounds** (optional): Default 5, max 10

### Checklist Design Rules

Each binary scoring variable must be:
- **Observable**: Answerable from the output alone (no rendering, no external data)
- **Structural**: Based on concrete characteristics, not subjective quality
- **Non-gameable**: Can't be trivially satisfied while degrading quality
- **Independent**: Evaluable without reference to other variables

**Disqualifiers** — rewrite or drop any variable that:
- Contains "quality", "tone", "feel", "compelling", "appropriate", or "well-written"
- Requires subjective taste rather than structural observation
- Combines two checks in one question (split them)

**Hard limit**: 3-6 variables. Below 3, the agent finds loopholes. Above 6, it games the checklist.

## Workflow

### Phase 0: Setup

1. Read the target file and identify the mutable section (constants block, prompt string, config object). **Record the exact line range** (e.g., `lines 12-45`) and note it in `results.tsv` as a header comment. All edits in subsequent rounds MUST be confined to this range. If the mutable section is ambiguous (e.g., multiple constants blocks), ask the user to confirm which block to optimize.
2. Back up the original: copy to `{filename}.backup.{ext}`. **BLOCKING GATE**: Verify the backup file exists on disk before proceeding. Do NOT delete this backup until Phase 4 is complete — this supersedes any general backup-deletion rules during the autoresearch run.
3. Create results directory: `tasks/autoresearch/{artifact-name}/`
4. Initialize `results.tsv` with headers: `round	score	status	description`
5. If eval script doesn't exist, help user build one (see Eval Method Specifications below)

### Phase 1: Baseline

1. Run the eval method against the current artifact state
2. Record the baseline score in `results.tsv`
3. Display to user:
   ```
   Baseline: {score} ({metric_name})
   Artifact: {file_path}
   Eval: {eval_method}
   Rounds: {max_rounds}
   ```

### Phase 2: Improvement Loop

For each round (1 to max_rounds):

#### Step 1: Analyze
- For LLM judge: Which checklist questions failed? Why?
- For eval script: What's the bottleneck? Which parameter is the likely lever?
- Prioritize the highest-impact change

#### Step 2: Mutate
Make **one conceptual change** per round. Types:

| Mutation Type | When to Use |
|--------------|-------------|
| **Adjust threshold** | A numeric parameter is too aggressive or too conservative |
| **Rebalance weights** | Signal weights don't match actual discriminative power |
| **Add explicit rule** | LLM prompt misses a case because it's not mentioned |
| **Add negative example** | LLM produces a pattern you want to ban |
| **Increase/decrease parallelism** | Throughput-bound by concurrency |
| **Change batch size** | Too many or too few items per request |
| **Tighten constraint** | Output is vague or over-broad |
| **Restructure logic** | Incremental changes hit ceiling, need structural change |

Rules:
- **One edit per round** — make exactly one edit to the mutable section. After editing, run `git diff` and verify the diff touches only one logical unit (one parameter value, one sentence in a prompt, one rule). If the diff shows changes in two or more distinct locations within the mutable section, split into separate rounds.
- Never remove passing logic — only add, refine, or reorder
- Commit after each mutation: `git commit -m "autoresearch: {description}"`
- All edits MUST fall within the recorded mutable section line range (see Phase 0 Step 1). If you find yourself editing outside the range, STOP — you are modifying the wrong code.

#### Step 3: Re-evaluate
Run the exact same eval method. Record the new score.

#### Step 4: Keep or Revert

```
if new_score > previous_score:
    KEEP — log "Round N: KEPT — {description}. Score: X → Y"
elif new_score == previous_score AND change removes a documented structural flaw:
    KEEP — log "Round N: KEPT (lateral) — {description}. Score: X (unchanged, structural fix)"
else:
    REVERT — git reset --hard HEAD~1
    log "Round N: REVERTED — {description}. Score: X → Y (regression)"
```

**After every REVERT**:
1. Read the mutable section and confirm it matches the pre-mutation snapshot
2. Re-run the eval and confirm the score equals the previous round's score
3. If either check fails, STOP and report corrupted state to the user

#### Step 5: Early Exit

Stop if ANY condition is met:
- Score reaches target (100% for checklist, user-defined for metrics)
- Max rounds reached
- 3 consecutive reverts (artifact is at its ceiling)
- Score converged (no improvement possible with single-variable changes)

### Phase 3: Finalize

1. Generate summary in `tasks/autoresearch/{artifact-name}/summary.md`:
   - Score progression table
   - Changes kept vs reverted
   - Final config/prompt diff from baseline
2. Present to user: "Score improved from X to Y over N rounds. N changes kept, N reverted."
3. Ask: "Accept the optimized version, or revert to the original?"

### Phase 4: Apply or Revert

- **Accept**: Delete `.backup` file, commit final state
- **Revert**: Restore from `.backup`, discard changes. Re-run the eval to confirm the score matches the original baseline recorded in Round 0. If it does not match, investigate before declaring the revert complete.

## Eval Method Specifications (MANDATORY — set up before Phase 1)

Before starting Phase 1, the eval method must be fully specified and runnable. Do not start the loop with a vague "run the eval."

### For LLM Prompt Artifacts (Judge Spec)

When the artifact is a prompt (system prompt, generation template, analysis rubric):

1. **Judge model**: Fix one model for the entire run (e.g., `claude-haiku-4-5-20251001`). Never change it mid-run — scores become non-comparable.
2. **Generator model**: Use a DIFFERENT model than the judge (e.g., generate with `claude-sonnet-4-6`, judge with `claude-haiku-4-5-20251001`). Same-model judging inflates scores.
3. **Judge prompt template**: Must produce exactly one line per criterion:
   ```
   CRITERION_1: PASS|FAIL
   CRITERION_2: PASS|FAIL
   ...
   ```
4. **Score computation**: `SCORE: {sum(PASS)} / {total_criteria}` — deterministic from judge output.
5. **Test inputs**: 2-4 representative inputs. Run ALL inputs every round (not just the one that failed).
6. **Run command**: Must be a single command that prints `SCORE: X/Y` as the last line.

### For Constants/Thresholds Artifacts (Eval Script Spec)

When the artifact is a numeric constant, threshold, or config parameter:

1. **Metric**: Define the single number that "better" means (e.g., precision@3, retrieval accuracy, F1 score, p95 latency). Not "performance" — a specific metric name.
2. **Test dataset**: Either an existing test suite OR a set of 5-10 labeled test cases with expected outputs. If no dataset exists, build one with the user before starting.
3. **Eval script**: A script that:
   - Imports the live constant from the target file
   - Runs each test case through the function that uses the constant
   - Computes the metric
   - Prints `SCORE: {metric_value}`
4. **Direction**: Specify whether higher is better or lower is better.

### For Scoring Algorithms (Eval Script Spec)

When the artifact is a scoring function, weight set, or classification algorithm:

1. **Labeled dataset** (BLOCKING GATE): A set of inputs with known-correct outputs (ground truth). Minimum 10 cases. If no dataset exists, help the user build one from production data or manual labeling **before proceeding to Phase 1**. The dataset must be saved to a file and committed. **Verify the dataset file exists on disk and is parseable by the eval script before starting Phase 1** — this is equivalent rigor to the eval script BLOCKING GATE.
2. **Metric** (lock during Phase 0): Choose one of F1, precision, recall, or accuracy. For multi-class, specify macro vs micro averaging. Record the chosen metric in `results.tsv` as a header comment. The metric MUST NOT change between rounds — scores become non-comparable.
3. **Eval script**: Same pattern as constants — import, run, score, print `SCORE({metric_name}): {value}` (e.g., `SCORE(F1): 0.82`). Including the metric name in the output prevents ambiguity across rounds.

### Eval Script Template

The following is a TypeScript example that should be adapted to the project's language and tooling:

```typescript
// scripts/eval-{artifact-name}.ts
import { ARTIFACT } from '../path/to/target-file';

const TEST_CASES = [
  { input: ..., expected: ... },
  // 5-10 cases minimum
];

let passed = 0;
for (const tc of TEST_CASES) {
  const result = runArtifact(ARTIFACT, tc.input);
  if (meetsExpectation(result, tc.expected)) passed++;
}

const score = passed / TEST_CASES.length;
// Include metric name for scoring algorithms; bare SCORE: for constants/prompts
const metricName = 'accuracy'; // or 'F1', 'precision', 'recall' — set during Phase 0
console.log(`SCORE(${metricName}): ${score}`);
process.exit(score >= 0.5 ? 0 : 1);
```

**BLOCKING GATE**: Do not proceed to Phase 1 until the eval script runs successfully and produces a `SCORE:` line. If it fails, fix it first.

## Error Handling

| Error | Recovery |
|-------|----------|
| No eval method available | Help user build an eval script (see pattern above) |
| Eval script fails to run | Fix the script before starting the loop |
| Score doesn't improve after 3 rounds | Stop, report ceiling, suggest structural changes |
| Baseline score is already optimal | Report — no optimization needed |
| Git state is dirty | Stash or commit before starting |

## Important Notes

- The backup is created BEFORE any mutations — the original is always recoverable
- Each mutation is a separate git commit for clean revert capability
- One change per round — never batch multiple unrelated changes
- The results.tsv is the audit trail — it documents what works and what doesn't
- For prompts: use a different model for judging than generating (reduces self-scoring bias)
- For code: deterministic evals are always preferred over LLM-judged evals
- This skill is triggered by `/feature-dev` Phase 5.5, `/code-review` post-review, and `/skill-creator` Step 7 — it's designed to be composable with other workflows
