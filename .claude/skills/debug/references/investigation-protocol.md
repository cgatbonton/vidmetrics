# Investigation Protocol

Structured process for systematic debugging. Follow these phases in order. Do not skip to fixes.

## Phase 1: Reproduce and Observe

**Goal**: Confirm the bug exists and understand its exact behavior.

1. Reproduce the bug with the exact steps described
2. Record the actual behavior vs expected behavior
3. Note: is it deterministic or intermittent?
4. Identify the minimal reproduction case
5. Check if recent changes correlate (use `git log --oneline -20` and `git diff HEAD~5`)

**Output**: A clear statement — "When [action], expected [X] but got [Y]. Reproducible [always/intermittently]."

## Phase 2: Gather Evidence

**Goal**: Collect data before forming hypotheses.

1. Read the error message/stack trace carefully — every word matters
2. Read the relevant source code (don't guess — actually read it)
3. Check logs at the time of failure
4. Check the data state (database records, API responses, state snapshots)
5. Identify the boundary where correct data becomes incorrect

**Output**: A list of facts — "Line X receives value Y. The database contains Z. The API returned W."

## Phase 3: Form Hypotheses

**Goal**: Generate ranked explanations from evidence.

1. Match symptoms against known bug patterns (load `references/bug-patterns.md`)
2. List 2-4 candidate hypotheses, ranked by likelihood
3. For each hypothesis, identify what evidence would confirm or refute it
4. Choose the most likely hypothesis to test first

**Output**: A ranked list — "H1 (most likely): [explanation] — would be confirmed by [evidence]. H2: ..."

## Phase 4: Test One Hypothesis at a Time

**Goal**: Confirm or eliminate hypotheses systematically.

1. Design a single, targeted test for the top hypothesis
2. Execute the test (add a log, check a value, read a config, run a query)
3. Evaluate: did the evidence confirm or refute the hypothesis?
4. If confirmed — proceed to Phase 5 (fix)
5. If refuted — eliminate this hypothesis, move to the next one
6. **Track the attempt count** — increment the fix counter after each failed fix attempt

**Rules**:
- One variable at a time. Never test two hypotheses simultaneously
- Prefer non-invasive investigation (reading, logging) before code changes
- Document what each test proved or disproved

## Phase 5: Fix with Precision

**Goal**: Apply the minimum change that addresses the root cause.

1. State the confirmed root cause in one sentence
2. Identify the exact code that needs to change
3. Write the minimal fix — no drive-by improvements
4. Verify the fix resolves the original reproduction
5. Check for regression — does the fix break anything adjacent?

**Rules**:
- The fix must address the root cause, not a symptom
- If the fix is larger than expected, pause and verify you have the right root cause
- Run existing tests after applying the fix

## Phase 6: Escalation Gate (3-Strike Rule)

**Trigger**: 3 fix attempts have failed to resolve the issue.

When this happens, STOP fixing and switch to architectural questioning:

1. "Am I debugging the right layer?" — Is the bug in the code, the infrastructure, or the design?
2. "Is my mental model of this system correct?" — Re-read the architecture, not just the bug site
3. "What assumption am I making that might be wrong?" — List every assumption explicitly
4. "Is this a symptom of a deeper structural problem?" — Would a correct architecture make this bug impossible?
5. "Should I ask the user for more context?" — Maybe the system was designed differently than assumed

**Output**: Either a revised hypothesis with a fundamentally different approach, or a clear question to the user explaining what was tried and why it failed.

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Do Instead |
|---|---|---|
| Shotgun debugging (change many things at once) | Can't isolate which change worked or introduced new bugs | One change at a time |
| Fixing symptoms without root cause | Bug returns in a different form | Trace to the source |
| Assuming the bug is where the error shows | Errors propagate far from origin | Trace data flow backwards |
| "It works now" without understanding why | The fix is accidental and fragile | Explain why it works |
| Adding defensive code everywhere | Hides the real bug, adds complexity | Fix at the boundary |
| Rewriting the module | Nuclear option destroys working code | Surgical fix only |
