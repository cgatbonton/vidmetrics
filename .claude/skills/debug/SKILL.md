---
name: debug
description: Systematic root-cause debugger for any bug in any codebase — application code, API routes, database issues, UI glitches, backend failures, or infrastructure problems. Traces data flow, matches against known bug patterns (race conditions, nil propagation, stale cache, config drift, effect loops, type coercion, missing error handling), and tests hypotheses one at a time. Enforces the iron law — no fixes without root cause investigation. If 3 fix attempts fail, stops and questions the architecture. Use when a bug is reported, a test fails unexpectedly, behavior is wrong but the cause is unclear, or when previous fix attempts have failed.
---

# Systematic Debugger

Root-cause-first debugging. No guessing. No shotgun fixes. Trace, hypothesize, test, fix — in that order.

## Iron Law

**Never apply a fix without first confirming the root cause through evidence.** A fix that works by accident is not a fix — it is a time bomb.

## When to Use

- A bug is reported (user-facing or test failure)
- Behavior deviates from expectations and the cause is not immediately obvious
- A previous fix attempt did not resolve the issue
- An intermittent failure needs systematic investigation
- The user says "debug", "why is this broken", "this doesn't work", "fix this bug"

## Do NOT Use When

- The cause is already known and just needs a code change (skip straight to fixing)
- The task is feature development, not debugging
- The issue is a build/config error with a clear error message and obvious fix

## Workflow

### Step 0: Accept the Bug Report

Parse the user's description into a structured bug statement:

```
OBSERVED: [what actually happens]
EXPECTED: [what should happen]
CONTEXT: [where, when, how often, any recent changes]
```

If the bug report is vague, ask exactly one clarifying question before proceeding. Do not ask more than one — start investigating with what is available.

**Output to user (REQUIRED before proceeding)**: The structured bug statement in OBSERVED/EXPECTED/CONTEXT format. This must be displayed before any file reads or investigation begins. If you cannot fill all three fields, state what is unknown and proceed — but the structure must be visible.

### Step 1: Reproduce and Observe

Load `references/investigation-protocol.md` and follow Phase 1.

1. Read the relevant source code — the actual files, not a mental model of them
2. Check recent git history (`git log --oneline -15`) for correlated changes
3. If there is an error message or stack trace, read every line of it
4. Establish the exact boundary where behavior diverges from expectations

**Output to user**: A one-paragraph situation report — what was observed, where, and whether it reproduces.

### Step 2: Gather Evidence

Follow Phase 2 of the investigation protocol.

1. Read all files in the code path (entry point to failure point)
2. Trace data flow forward: what value enters, how it transforms, where it exits
3. Check state: database records, API responses, environment variables, config files
4. Identify the exact line or boundary where correct data becomes incorrect

**Rules**:
- Read the code. Do not assume what it does based on function names
- **Always re-read files**, even if you read them earlier in this conversation. Code may have changed since your last read. Never rely on memory of file contents during debugging
- Check types at boundaries — what the caller sends vs what the callee expects
- If the bug involves async code, map the execution order explicitly
- During evidence gathering, you will see code problems unrelated to the bug. Note them if relevant but do NOT plan to fix them. Your scope is the reported bug and nothing else

### Step 3: Match Against Known Patterns

Load `references/bug-patterns.md` and compare the gathered evidence against each pattern.

For each candidate pattern, check:
- Do the symptoms match?
- Is the code in a location where this pattern commonly occurs?
- Does the evidence support or contradict this pattern?

Rank hypotheses by likelihood. Present the top 2-3 to anchor the investigation.

**Output to user (REQUIRED)**: For each hypothesis, explicitly name the matching bug pattern by number and name (e.g., "Pattern #3: Stale Cache / Stale Closure"). If no pattern matches, state "No known pattern match — novel bug." This forces consultation of the reference.

### Step 4: Test Hypotheses (One at a Time)

Follow Phase 4 of the investigation protocol.

For each hypothesis, starting with the most likely:

1. Design a single test that would confirm or refute it
2. Execute the test (add a log, check a value, read a config, run a query)
3. Report the result: confirmed or refuted, with evidence
4. If confirmed, proceed to Step 5
5. If refuted, explicitly eliminate it and move to the next hypothesis

**Track the attempt counter.** Initialize at 0. Increment after each failed fix attempt.

**What counts as a fix attempt**: Any edit to application source code intended to resolve the bug. Adding temporary logging for investigation is NOT a fix attempt. Changing application logic, adding null checks, modifying config, or altering control flow IS a fix attempt — regardless of whether you call it "testing a theory." If you edit source code (beyond temporary logs) and the bug persists, increment the counter.

**State the escalation contract proactively**: When entering Step 5 (fix phase) or when planning a fix, state: "Fix attempt N/3. If this does not resolve the bug, I will [test next hypothesis / escalate]." Repeat after applying the fix and observing the result.

### Step 5: Fix with Precision

Follow Phase 5 of the investigation protocol.

1. State the confirmed root cause in one sentence
2. Apply the minimum change that addresses it
3. Verify the fix resolves the original reproduction case
4. Run related tests to check for regressions
5. If the fix works, explain why it works — not just what changed

**Constraints**:
- The fix must target the root cause, not a symptom
- No drive-by improvements, refactors, or "while I'm here" changes
- If the fix is surprisingly large, pause — verify the root cause is correct

### Step 5b: Write Regression Test (MANDATORY)

**Every bug fix must include a regression test.** This is non-negotiable per the project testing policy.

1. Write a test that **fails without the fix** and **passes with it**
2. Place it in the correct test directory following the project's conventions
3. The test should reproduce the exact conditions that caused the bug
4. Run the test to verify it passes

If the bug is in domain logic: write a unit test. If the bug is in a route/workflow: write an integration test. Follow the project's testing conventions.

**Verification gate (REQUIRED before declaring fix)**: State the causal chain: "[Root cause] caused [intermediate effect] which produced [observed symptom]. The fix [what was changed] addresses the root cause by [mechanism]." If you cannot complete this chain, the fix is not verified — do not declare the bug resolved.

### Step 6: Escalation (3-Strike Rule)

**Trigger**: The fix attempt counter reaches 3.

When this triggers, STOP attempting fixes. Follow Phase 6 of the investigation protocol.

Present to the user:

```
ESCALATION: 3 fix attempts failed.

ATTEMPTED:
1. [hypothesis] -> [fix] -> [why it failed]
2. [hypothesis] -> [fix] -> [why it failed]
3. [hypothesis] -> [fix] -> [why it failed]

QUESTIONING ARCHITECTURE:
- [Am I debugging the right layer?]
- [What assumption might be wrong?]
- [Is this a symptom of a deeper structural problem?]

RECOMMENDED NEXT STEP: [specific question or fundamentally different approach]
```

Do not attempt a 4th fix without either new information from the user or a fundamentally different hypothesis about the root cause.

## State Tracking (MANDATORY)

Append this single-line state tracker to the output of **every step** (Steps 0 through 6). This is not optional — it is the backbone that keeps the protocol on track and enables the escalation rule to function.

```
[DEBUG] Bug: <one-line> | Status: investigating|hypothesis-testing|fixing|escalated | Hypothesis: <current> | Attempts: 0/3 | Eliminated: <list>
```

If the state tracker is not being maintained, the escalation rule (Step 6) cannot function. Drop the tracker = drop the safety net.

## Error Handling

| Situation | Recovery |
|-----------|----------|
| Cannot reproduce the bug | Ask for exact reproduction steps, check environment differences, check if it was already fixed |
| Code path is too complex to trace manually | Break into segments, trace one segment at a time, use logging to narrow down |
| Multiple bugs interacting | Isolate each bug, fix the most upstream one first |
| Fix introduces a new bug | Revert the fix, re-examine the root cause — the mental model is likely wrong |
| User pushes to "just fix it" | Explain that the investigation prevents wasted time on wrong fixes, but keep it brief |

## References

- Load `references/investigation-protocol.md` for the full 6-phase investigation process
- Load `references/bug-patterns.md` for the known bug pattern library with symptoms, verification steps, and fix patterns
