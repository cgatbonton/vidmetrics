---
description: Guided feature development with codebase understanding and architecture focus
argument-hint: Optional feature description
---

# Feature Development

You are helping a developer implement a new feature. Follow a systematic approach: understand the codebase deeply, identify and ask about all underspecified details, design elegant architectures, then implement.

## Core Principles

- **Ask clarifying questions**: Identify all ambiguities, edge cases, and underspecified behaviors. Ask specific, concrete questions rather than making assumptions. Wait for user answers before proceeding with implementation. Ask questions early (after understanding the codebase, before designing architecture).
- **Understand before acting**: Read and comprehend existing code patterns first
- **Read files identified by agents**: When launching agents, ask them to return lists of the most important files to read. After agents complete, read those files to build detailed context before proceeding.
- **Simple and elegant**: Prioritize readable, maintainable, architecturally sound code
- **Track progress**: Write plan to `tasks/todo.md` with checkable items. Update as you progress.
- **Project rules are non-negotiable**: Follow all rules defined in the project's CLAUDE.md files. These are constraints, not options.

---

## Phase 1: Discovery

**Goal**: Understand what needs to be built

Initial request: $ARGUMENTS

**Actions**:

1. **Write plan to `tasks/todo.md`** with all phases as checkable items. Minimum structure:
   ```
   # Feature: [name]
   ## Complexity: [Small/Medium/Large]
   - [ ] Phase 1: Discovery
   - [ ] Phase 2: Codebase Exploration
   - [ ] Phase 3: Clarifying Questions
   - [ ] Phase 4: Architecture Design
   - [ ] Phase 4.5: Plan Debate
   - [ ] Phase 5: Implementation
   - [ ] Phase 5.8: Scope Delta Check
   - [ ] Phase 6: Quality Review
   - [ ] Phase 7: Close-out
   ```
   Run `wc -l tasks/todo.md` and confirm at least 10 lines.

2. **Read project context (with evidence)**:
   - Read `CLAUDE.md` (root) and any architecture documentation (e.g., `ARCHITECTURE.md`, `docs/architecture.md`, or equivalent).
   - After reading architecture docs, paste **3 takeaways relevant to this feature** (e.g., "Data flow traces API → service → database — relevant because this feature needs a new service layer"). If you cannot identify 3 relevant takeaways, state why — but you must demonstrate you read the file.
   - Then enumerate ALL directory-specific CLAUDE.md files from the project that could be touched by this feature. List them in a table:

   | CLAUDE.md Path | Why Relevant |
   |---------------|-------------|
   | `src/api/CLAUDE.md` | New API routes |
   | `src/components/CLAUDE.md` | New UI components |
   | `database/CLAUDE.md` | Schema changes |
   | ... | ... |

   **If fewer than 3 CLAUDE.md files listed, re-scan the project structure and root CLAUDE.md for references.** Even a "simple" change touches multiple subsystems. Err on the side of over-reading — read all listed files now. This is non-optional and must complete before Phase 2.

3. **Triage complexity** — state your assessment in this exact format in your response:

   > **Complexity: [Small / Medium / Large]** — [justification referencing: number of files affected, whether new schemas/tables are needed, whether new services are needed, and whether it crosses multiple subsystems]

   Tier definitions:
   - **Small** (single file, existing pattern reuse): Skip Phase 2 agents, read files directly
   - **Medium** (2-5 files, existing patterns): Standard workflow
   - **Large** (new schemas, new services, cross-cutting): Increase to 3 explorer agents

4. If feature is unclear, ask user for:
   - What problem are they solving?
   - What should the feature do?
   - Any constraints or requirements?

5. **Summarize understanding and confirm with user (BLOCKING)**:

   Present a structured summary using this template:

   > **Feature Summary**
   > - **What**: [one sentence describing the feature]
   > - **Complexity**: [Small/Medium/Large]
   > - **Key CLAUDE.md rules discovered**: [2-3 bullet points from the files you read]
   > - **Existing code to leverage**: [any relevant code found]
   > - **Open questions**: [anything unclear — or "None, scope is well-defined"]
   >
   > Does this match your intent? Should I proceed to Phase 2?

   **Anti-skip rule**: Do NOT launch Phase 2 agents, read implementation source files, or begin architecture work in this same response. Phase 1 output ends with the confirmation question above. If the user's request seems perfectly clear, the summary is still required — "obvious" features have the highest rate of misunderstood scope.

---

## Phase 2: Codebase Exploration

**Goal**: Understand relevant existing code and patterns at both high and low levels

**This phase is MANDATORY for Medium and Large features.** Only Small features (single file, existing pattern reuse) may skip it — and if skipped, state: "Phase 2 skipped — Small feature, reading files directly."

**Actions**:

### Step 1: Launch explorer agents

Launch 2-3 code-explorer agents in parallel. Each agent MUST be instructed to return a **numbered list of file paths** (not prose with files buried in paragraphs). Include this exact line in every explorer prompt:

> "Return your findings as a NUMBERED LIST of absolute file paths (minimum 5, maximum 15) with a one-line description per file. Include any CLAUDE.md files found in the directories you explore. Do NOT return prose summaries — return the file list first, then any notes after."

Each agent should:
   - Trace through the code comprehensively and focus on getting a comprehensive understanding of abstractions, architecture and flow of control
   - Target a different aspect of the codebase (eg. similar features, high level understanding, architectural understanding, user experience, etc)

   **Example agent prompts**:
   - "Find features similar to [feature] and trace through their implementation comprehensively. Return your findings as a NUMBERED LIST of absolute file paths (minimum 5, maximum 15) with a one-line description per file. Include any CLAUDE.md files found in the directories you explore. Do NOT return prose summaries — return the file list first, then any notes after."
   - "Map the architecture and abstractions for [feature area], tracing through the code comprehensively. Return your findings as a NUMBERED LIST of absolute file paths (minimum 5, maximum 15) with a one-line description per file. Include any CLAUDE.md files found in the directories you explore. Do NOT return prose summaries — return the file list first, then any notes after."
   - "Analyze the current implementation of [existing feature/area], tracing through the code comprehensively. Return your findings as a NUMBERED LIST of absolute file paths (minimum 5, maximum 15) with a one-line description per file. Include any CLAUDE.md files found in the directories you explore. Do NOT return prose summaries — return the file list first, then any notes after."

### Step 2: Quality gate on agent output (BLOCKING)

After agents return, verify quality before proceeding:
- **Did each explorer return at least 5 file paths?** If any agent returned fewer than 5, its prompt was too vague or too narrow — relaunch with a more specific prompt that (a) names a specific directory or feature to explore and (b) asks the agent to explore at least 3 different subdirectories.
- **Breadth check**: If all files returned by any single agent come from fewer than 2 top-level directories, the exploration was too narrow — relaunch that agent targeting a different area of the codebase.
- **Did any explorer return CLAUDE.md files from explored directories?** If zero CLAUDE.md files were returned across all agents, at least one prompt missed the instruction — relaunch or manually search: `find [explored-directories] -name "CLAUDE.md"`.

### Step 2b: Deduplicate and sweep for CLAUDE.md files

1. **Deduplicate**: Collect all file paths from all agents into a single list. Remove duplicates. The combined unique file count must be **at least 8**. If fewer than 8 unique files after deduplication, relaunch the agent that returned the fewest unique files with a broader prompt.
2. **CLAUDE.md sweep**: Collect all unique directories that agents explored. For each, run: `find <dir> -maxdepth 2 -name "CLAUDE.md"`. Add any CLAUDE.md files found to the read list. This step is mandatory — do not rely solely on explorer agents to discover CLAUDE.md files.

### Step 3: Read ALL returned files (with evidence)

Read every file in the deduplicated list from Step 2b. After reading, list the files you read in your response as a **complete** numbered checklist:

```
Files read from explorer agents (deduplicated):
1. [x] /path/to/file1.ts
2. [x] /path/to/file2.ts
3. [x] /path/to/CLAUDE.md (from sweep)
...
N. [x] /path/to/fileN.ts
```

**Do not proceed to Phase 3 until this list is present in your response AND every file from the deduplicated list appears on it.** If any file was skipped (e.g., too large, not found), mark it `[ ]` with a reason. The checklist must account for every file — an incomplete list is a FAIL.

### Step 4: Synthesis summary (BLOCKING)

Present a structured summary that covers ALL of these categories (mark "None found" for any that don't apply):

1. **Reusable code found**: Existing hooks, utilities, components, or services that can be reused or extended (with file paths)
2. **Naming/structure conventions**: How similar features name their files, organize their directories, export their types
3. **Data flow patterns**: How data moves through the system in the explored area
4. **CLAUDE.md rules discovered**: Any directory-specific rules, gotchas, or constraints found in CLAUDE.md files that affect this feature
5. **Integration points**: Where this feature will connect to existing code — name the **specific file AND function/export** (e.g., "`useAuth()` in `hooks/useAuth.ts`"), not just file paths

**Synthesis self-audit (BLOCKING)**: Before presenting the synthesis, verify: every category that is NOT marked "None found" includes at least one **specific file path**. If a category mentions code without a file path (e.g., "several hooks in the hooks directory"), it is too vague — add the specific path or mark "None found." If the self-audit fails, revise before proceeding.

This summary is the foundation for Phase 3 questions and Phase 4 architecture. A vague summary produces vague architecture.

---

## Phase 3: Clarifying Questions

**Goal**: Fill in gaps and resolve all ambiguities before designing

**CRITICAL**: This is one of the most important phases. DO NOT SKIP — even if the feature seems obvious. Hidden complexity in auth boundaries, error states, backward compatibility, and performance at scale ALWAYS exists.

**Anti-skip rule**: There is no feature simple enough to skip this phase. A "simple CRUD endpoint" still has questions about validation rules, error responses, permissions, pagination, and naming. If you catch yourself thinking "this is straightforward, I'll skip to architecture" — that is the signal to be MORE thorough, not less.

### Minimum Question Counts (by complexity from Phase 1 triage)

- **Small** (single file, pattern reuse): 3+ questions minimum
- **Medium** (2-5 files, existing patterns): 5+ questions minimum
- **Large** (new schemas, new services, cross-cutting): 8+ questions minimum

These are minimums. More is better. If you cannot reach the minimum, you haven't thought hard enough about edge cases.

### Mandatory Question Categories

Every question set MUST cover ALL of the following categories. Organize your questions under these headings:

1. **Scope Boundaries** — What is explicitly IN scope vs OUT of scope? What adjacent features should NOT be affected? Where does this feature end and another begin?
2. **Error States & Edge Cases** — What happens when things go wrong? Network failures, invalid input, partial success, rate limits, timeouts, concurrent access. What does the user see?
3. **Integration Points** — How does this interact with existing features? Which existing hooks, services, routes, or schemas are affected? Are there upstream/downstream dependencies?
4. **Data Model & Persistence** — What data is created, read, updated, or deleted? What are the validation rules? Is there existing data that needs migration or backward compatibility?
5. **Auth & Permissions** — Who can perform this action? Are there role-level or user-level restrictions? Does this respect existing auth patterns?
6. **Performance & Scale** — Will this be called frequently? Does it need pagination, caching, debouncing, or background processing? What happens with 1000x the expected data volume?

For **Small** features: categories 1-3 are mandatory, 4-6 as applicable.
For **Medium/Large** features: ALL 6 categories are mandatory.

**Question depth floor**: Each question must require a decision or a choice between alternatives — not just a yes/no. Not "Are there any auth concerns?" but "Should this endpoint be restricted to admins, or should any authenticated user be able to trigger it?"

### Actions

1. **Re-read Phase 2 synthesis (BLOCKING)**: Before drafting any questions, go back and re-read your Phase 2 Step 4 synthesis summary. Copy the **Reusable code found** and **Integration points** sections into your working context. These are your grounding sources for questions. If you cannot find your Phase 2 synthesis, you skipped Phase 2 — go back and complete it.

2. For each mandatory category above, draft at least one specific question. **Questions MUST reference specific code patterns, files, or architectural decisions discovered in Phase 2.** Tag each grounded question with a citation: `[ref: filepath:pattern]`.

   **Good example**: "The `jobs` table tracks background job state with `status`, `error_message`, and `retry_count` [ref: schema.ts:jobs]. Should this feature's background tasks reuse this table or get a dedicated one? Reusing it means inheriting the existing retry/failure UI in the dashboard."

   **Bad example**: "How should we handle errors?" (No file reference, no alternative presented, answerable with a vague "handle them gracefully")

   **Another good example**: "The `useDashboardData` hook already polls `/api/analytics/summary` every 30 seconds [ref: hooks/useDashboardData.ts:refetchInterval]. Should this feature piggyback on this polling interval, or run independently? Piggybacking reduces API calls but couples the features."

   **Another bad example**: "Should we use polling or websockets?" (Generic architecture question with no reference to what the codebase actually does)

3. **Present all questions to the user in a clear, organized list grouped by category** — even if the feature seems straightforward

4. **Post-question self-audit (BLOCKING — must be VISIBLE in your response)**: Before presenting questions to the user, run this audit and **paste it in your response** exactly as shown:

   ```
   ### Phase 3 Self-Audit
   - Question count: [N] ([complexity tier] requires [M]+) — PASS/FAIL
   - Category coverage:
     - Scope Boundaries: Q[numbers] — PASS/MISSING
     - Error States: Q[numbers] — PASS/MISSING
     - Integration Points: Q[numbers] — PASS/MISSING
     - Data Model: Q[numbers] — PASS/MISSING/N/A (Small only)
     - Auth & Permissions: Q[numbers] — PASS/MISSING/N/A (Small only)
     - Performance & Scale: Q[numbers] — PASS/MISSING/N/A (Small only)
   - Code-grounded questions: [N] of [total] have [ref:] tags ([percentage]%) — PASS (>=60%) / FAIL
   - Error state question present: PASS/FAIL
   - Backward compatibility addressed: PASS / "No concerns because [reason]"
   ```

   If ANY line shows FAIL or MISSING, add questions to fix it before presenting. Do not present questions with a failing audit.

5. **Present questions and WAIT for answers**

### BLOCKING Gate

**Do not proceed to Phase 4 until the user has answered all questions.** If the user answers some but not others, note which remain unanswered and ask again. Do not assume defaults for unanswered questions.

If the user says "whatever you think is best" or "use your judgment":
1. Provide your specific recommendation for each unanswered question (not "I'll figure it out" — state the actual decision you'd make)
2. Present the recommendations as a numbered list
3. Get explicit confirmation: "Do you approve these recommendations? (yes/no)"
4. Do not proceed until confirmation is received

---

## Phase 4: Architecture Design

**Goal**: Design multiple implementation approaches with different trade-offs

**Non-negotiable constraints**: All approaches must satisfy the rules defined in the project's CLAUDE.md files. Read all relevant CLAUDE.md files discovered in Phases 1-2 and treat their rules as hard constraints, not suggestions.

**Actions**:

### Step 1: Launch architect agents

Launch 2-3 code-architect agents in parallel. Each agent MUST have a **distinct focus label** in its prompt — use these exact labels (or similar that are clearly non-overlapping):
   - **"Minimal Changes"** — smallest diff, maximum reuse of existing code, fewest new files
   - **"Clean Architecture"** — best long-term maintainability, elegant abstractions, even if more files/refactoring
   - **"Pragmatic Balance"** — ship fast with acceptable quality, trade-offs explicitly called out

Each agent prompt must include: (a) the focus label, (b) the non-negotiable constraints from the project's CLAUDE.md files, (c) instruction to return a concrete file list and data flow, not just prose descriptions.

### Step 2: Label verification on agent output

After architect agents return, verify each output reflects its assigned label:
- Does the "Minimal Changes" output actually propose fewer files and more reuse than the others? If it proposes 8+ new files, it contradicts its label.
- Does the "Clean Architecture" output introduce at least one new abstraction or structural improvement? If it proposes zero new abstractions, it contradicts its label.
- Does the "Pragmatic Balance" output explicitly call out trade-offs? If it reads identically to another approach, it's not distinct.

If any output contradicts its label, relaunch that agent with a clarified brief that forces alignment. Example: "You labeled this 'Minimal Changes' but proposed 8 new files. Redesign with a hard cap of 3 new files, reusing existing [specific hooks/components from Phase 2]."

### Step 3: Deduplication check (BLOCKING — with evidence)

After all architect agents return, compare their core proposals. Produce a **structural difference table**:

| Dimension | Approach A | Approach B | Approach C | Same? |
|-----------|-----------|-----------|-----------|-------|
| File organization | (specific structure) | (specific structure) | (specific structure) | YES/NO |
| Data flow | (specific path) | (specific path) | (specific path) | YES/NO |
| API/interface shape | (specific routes/interfaces) | (specific routes/interfaces) | (specific routes/interfaces) | YES/NO |
| State management strategy | (specific approach) | (specific approach) | (specific approach) | YES/NO |
| Key abstraction difference | (specific name) | (specific name) | (specific name) | YES/NO |

**Gate**: At least 2 rows must be marked "NO" (genuinely different). If fewer than 2 rows differ, the approaches are structurally redundant. Relaunch the redundant agent with a brief that forces a different structural choice in one of the "YES" dimensions. Do not proceed until 2+ dimensions differ.

### Step 4: Constraint compliance check (with evidence per approach)

Before presenting to user, verify each approach against EVERY non-negotiable constraint from the project's CLAUDE.md files. For each approach, produce a filled checklist with **specific evidence** (not just checkmarks):

**Approach A (label):**
- [ ] [Constraint 1 from CLAUDE.md] — [specific evidence: which files, which patterns, how it complies]
- [ ] [Constraint 2 from CLAUDE.md] — [specific evidence]
- [ ] [Constraint 3 from CLAUDE.md] — [specific evidence]
- ...

(Repeat for each approach.)

Mark any violations. **Filter out non-compliant approaches** — do not present them to the user. If all approaches are filtered out, relaunch architects with the constraints emphasized. If a constraint doesn't apply (e.g., no DB changes), write "N/A — [reason]."

### Step 5: Present to user

Present to user with ALL of the following (not optional):
- Brief summary of each approach (2-3 sentences)
- **Structured comparison table** with concrete differences:

| Dimension | Approach A (label) | Approach B (label) | Approach C (label) |
|-----------|-------------------|-------------------|-------------------|
| Files created/modified | count + list | count + list | count + list |
| New abstractions introduced | specific names | specific names | specific names |
| Data flow | brief path | brief path | brief path |
| Risk/complexity | LOW/MED/HIGH + why | LOW/MED/HIGH + why | LOW/MED/HIGH + why |
| Estimated LOC | rough number | rough number | rough number |

**Table quality gate**: Every cell in the comparison table must contain at least one **concrete noun** (a file name, hook name, component name, route path, or number). Cells containing ONLY qualitative words are invalid. Examples:
- INVALID: "Simpler approach" / "Standard pattern" / "Moderate complexity"
- VALID: "3 files: useAlertThreshold.ts, AlertBanner.tsx, POST /api/alerts" / "Reuses existing useAuth hook" / "MED — new background job adds operational surface area"

If any cell fails this gate, replace the qualitative word with the specific noun it refers to.

- **Your recommendation using this template** (fill in all blanks):

> "I recommend Approach **[X]** because: (1) it touches **[N] files** vs [other approach]'s **[M] files**, (2) it reuses **[specific existing hook/component/utility]**, (3) the main trade-off is **[specific limitation or future cost]**. The primary risk is **[concrete failure scenario]**."

Not "I recommend A because it's simpler" — every claim must have a concrete referent.

- When architect outputs conflict on a specific decision, resolve using CLAUDE.md conventions as the tiebreaker and note which convention resolved it.

### Step 6: Post-flight self-audit (BLOCKING — complete before presenting to user)

Before showing the architecture options to the user, verify these 6 items. Paste "PASS" or "FAIL" for each:

1. **Distinct labels?** Does each architect output reflect its assigned trade-off direction (minimal=fewer files, clean=new abstractions, pragmatic=explicit trade-offs)? → PASS/FAIL
2. **Structural dedup?** Does the structural difference table show 2+ "NO" rows? → PASS/FAIL
3. **Constraint compliance?** Does every presented approach have a filled constraint checklist with specific evidence (not just checkmarks)? → PASS/FAIL
4. **Table concreteness?** Does every cell in the comparison table contain at least one concrete noun (file name, number, hook name)? → PASS/FAIL
5. **Recommendation evidence?** Does the recommendation cite specific file counts, specific reused code, and a specific trade-off? → PASS/FAIL
6. **Approval question?** Does the output end with an explicit question asking the user to choose an approach? → PASS/FAIL

If any item is FAIL, fix it before presenting. Do not show partial or vague results to the user.

### Step 7: BLOCKING GATE — User chooses

**Ask user which approach they prefer. Do not proceed to Phase 4.5 until the user explicitly chooses.** If the user says "whatever you think" or "your call", confirm your recommendation and state: "Proceeding with Approach [X] based on [one-line reason]. Say 'stop' if you want to reconsider."

---

## Phase 4.5: Plan Debate (Adversarial Consensus)

**Goal**: Stress-test the chosen architecture through adversarial debate before implementation begins.

**Maximum 3 rounds.** After Round 3, any remaining HOLD items become Unresolved Disagreements for the user to decide. Do not continue debating beyond 3 rounds.

**Actions**:

### Step 0: Write the debate plan file

Before invoking the adversarial reviewer, write the full architecture plan to `tasks/debate-plan.md`. This file MUST contain these sections (skip any that genuinely don't apply, but do not omit applicable ones):

```markdown
## Approach
[Which architecture was chosen and why]

## Files to Create
[Full paths with one-line description each]

## Files to Modify
[Full paths with specific changes planned]

## Data Flow
[Step-by-step data flow from trigger to result]

## API/Interface Shape
[Method, path, request/response schema for each route or interface — or "None" if no new APIs]

## Schema/DB Changes
[Tables, columns, indexes, migrations — or "None"]

## Key Design Decisions
[Trade-offs made and why]

## Project Constraints (MANDATORY — the reviewer needs full project context)
- [List ALL relevant rules from the project's CLAUDE.md files]
- [Include architectural patterns, naming conventions, state management rules]
- [Include testing conventions, code organization rules]
- [Add any feature-area-specific constraints from directory-level CLAUDE.md files]
```

Without the Project Constraints section, the reviewer evaluates against generic best practices and produces findings irrelevant to this codebase.

**Verify the file before proceeding.** After writing `tasks/debate-plan.md`, run BOTH commands and paste the output:
```bash
wc -l tasks/debate-plan.md && grep -c "^## " tasks/debate-plan.md
```
- If fewer than 15 lines → too thin, add detail before invoking the reviewer.
- If `grep` count is less than 5 → missing required sections, add them.
- If `grep "Project Constraints" tasks/debate-plan.md` returns nothing → you forgot the most important section. Add it.

### Step 1: Adversarial Critique

Invoke `/codex` on the debate plan file with adversarial instructions. The reviewer should act as a hostile staff engineer finding every flaw in: security, edge cases, architectural anti-patterns, performance, race conditions, missing error handling, over-engineering, under-engineering. For each issue, it should assign CRITICAL/HIGH/MEDIUM/LOW severity and propose a concrete fix.

If `/codex` is unavailable, spawn a separate subagent as the hostile reviewer with this EXACT framing:

> "You are a hostile staff engineer reviewing an architecture plan. You MUST find at least 3 issues, with at least 1 rated CRITICAL or HIGH. You are not trying to be helpful — you are trying to break this plan. Focus on: security holes, race conditions, missing error paths, schema mistakes, and violations of the project constraints listed in the plan. If you cannot find real issues, say so explicitly — do not fabricate concerns."

The subagent must receive the full contents of `tasks/debate-plan.md`. The debate structure (Steps 2-5) remains the same regardless of which reviewer is used.

### Step 2: Respond to Critique

For each issue the reviewer raised, state one of:
- **AGREE** — the issue is valid, incorporate it into the plan
- **PARTIALLY AGREE** — the concern is real but the severity or fix is wrong. Explain why and propose a better fix.
- **DISAGREE** — the issue is incorrect, theoretical, or irrelevant given actual project constraints. Provide concrete evidence (code references, project context) for why.

Structure the response as a table:

| # | Finding | Severity | Verdict | Reasoning |
|---|---------|----------|---------|-----------|
| 1 | ... | CRITICAL/HIGH/MEDIUM/LOW | AGREE / PARTIALLY AGREE / DISAGREE | ... |

**Rubber-stamp check (BLOCKING):** If you agreed with >80% of findings without pushback, you MUST do one of:
   - (a) Identify at least 1 finding where the reviewer's severity or fix is wrong and mark PARTIALLY AGREE, OR
   - (b) Explicitly state: "All findings are genuinely correct — rubber-stamp check passed" with a one-sentence justification for why no pushback is warranted.
   Option (b) is acceptable but must be conscious, not default. If every finding seems valid AND the plan file has fewer than 20 lines, the plan was too vague — rewrite `tasks/debate-plan.md` with more detail and rerun Step 1.

### Step 3: Send Rebuttals Back

**Rebuttal is MANDATORY unless you AGREE with every single finding.** If you agree with all findings, explicitly state: "All findings accepted — no rebuttal round needed" and skip to Step 5.

If you DISAGREE or PARTIALLY AGREE with even one finding, you MUST send rebuttals back to the reviewer. Do not skip this because the user is impatient or because constructing the prompt is tedious.

Send your rebuttals to the reviewer and ask it to respond with CONCEDE (drop), REVISE (adjust severity/fix), or HOLD (maintain with new evidence) for each item.

**Rebuttal evidence (paste after each rebuttal round):** Quote at least 2 reviewer responses verbatim (e.g., "Item 3 — CONCEDE: Fair point..."). This proves the rebuttal was actually sent and a response was received. If you cannot quote reviewer responses, the rebuttal didn't happen — go back and send it.

### Step 4: Continue until consensus (max 3 rounds)

Repeat Steps 2-3 until consensus or 3 rounds, whichever comes first. Consensus means:
- No CRITICAL or HIGH issues remain unaddressed
- Any remaining MEDIUM/LOW disagreements are documented as accepted trade-offs
- All items are resolved as: agreed, conceded, revised, or held

### Step 5: Present consensus to user

Show the final result with ALL THREE sections (do not silently omit any):

#### Agreed Changes (both sides agree)
Each item must specify: (a) what changes in the plan, (b) which file/component is affected, (c) the severity that motivated the change. Not just "add error handling" — specify WHERE and WHAT.

#### Unresolved Disagreements (user decides)
If empty, explicitly state: "None — full consensus reached." Do NOT silently omit this section.
For each held item:
- **Reviewer position**: ...
- **Claude position**: ...
- **User action needed**: Choose one approach

#### Updated Plan
A COMPLETE rewrite of the architecture plan incorporating all agreed changes. Not a diff, not "same as before plus X." The user should be able to read ONLY this section and have the full, amended plan.

**Write the Updated Plan to `tasks/debate-plan.md`** (overwrite the pre-debate version). Then verify:
```bash
grep -c "^## " tasks/debate-plan.md
```
Paste the output. The count should match the original section count (or more if sections were added). If sections are missing, the rewrite is incomplete.

### Post-flight self-audit (BLOCKING — run before presenting to user)

Before showing the consensus to the user, verify these 5 items. Paste "PASS" or "FAIL" for each:
1. **Agreed Changes present?** Does your output contain the header "Agreed Changes"? → PASS/FAIL
2. **Unresolved Disagreements present?** Does your output contain the header "Unresolved Disagreements" (even if "None")? → PASS/FAIL
3. **Updated Plan written to file?** Did you write the updated plan to `tasks/debate-plan.md`? → PASS/FAIL
4. **Rebuttal evidence present?** Did you quote at least 2 reviewer responses verbatim, OR explicitly state "All findings accepted — no rebuttal round needed"? → PASS/FAIL
5. **Approval question included?** Does your output end with "Approve this plan for implementation? (yes/no)"? → PASS/FAIL

If any item is FAIL, fix it before presenting. Do not show partial results to the user.

**HARD GATE: Do not write any implementation code until the user explicitly approves the consensus.** The approval request must include:
1. Number of plan amendments made
2. Whether any unresolved disagreements need user decision
3. An explicit question: "Approve this plan for implementation? (yes/no)"

Prior statements like "just build it" or "go ahead" do NOT count as approval for the post-debate plan — the debate may have changed the plan significantly.

---

## Phase 5: Implementation

**Goal**: Build the feature

**DO NOT START WITHOUT USER APPROVAL**

**Actions**:
1. Wait for explicit user approval
2. Read all relevant files identified in previous phases
3. Implement following chosen architecture
4. Follow codebase conventions strictly
5. Write clean, well-documented code
6. After each file edit, check if the file exceeds 500 lines. If so, suggest a split before continuing.
7. Update `tasks/todo.md` as you progress
8. **Wiring verification (per file)**: Immediately after creating any new module/utility/hook — before writing the next file — run `grep -r "exportedName" path/to/parent/`. Paste the grep result. If zero matches, the module is dead code. Wire the import and call site before proceeding. This check is per-file, not deferred to end of Phase 5.
9. **Tests alongside implementation**: When you write a function that transforms data, evaluates conditions, computes results, or maps state (e.g., data builder, threshold evaluator, status mapper, payload transformer, row-to-display-state converter), write a behavioral test for it immediately — in the same step, not deferred. Run the project's test command on the test file and paste the result. A function that only calls `fetch()`, writes to DB, or returns JSX does not need a test here.

---

## Phase 5.5: Artifact Optimization (Conditional)

**Trigger**: Does Phase 5 output include an LLM prompt, tunable constants/thresholds, or a scoring algorithm? If yes → invoke `/autoresearch` with the artifact. Ask user approval first. If no → note "Phase 5.5 skipped" in `tasks/todo.md` and proceed.

---

## Phase 5.8: Scope Delta Check

**Goal**: Ensure what was built matches what was approved

**Actions**:
1. Run `git diff --name-only` to get the exact list of files modified/created. This is the source of truth — do not self-report from memory.
2. Compare this list against the architecture plan approved in Phase 4.5. Categorize each file as: planned, unplanned-but-necessary, or unplanned-and-unexpected.
3. If any "unplanned-and-unexpected" files exist, present them to the user: "The following changes deviate from the approved plan: [list]. Should I proceed with review, or adjust?"
4. If all files are planned or necessary, note "Scope delta: clean" and proceed

---

## Phase 6: Quality Review

**Goal**: Ensure code is simple, DRY, elegant, easy to read, and functionally correct

**Actions**:
1. **Build/lint verification (BLOCKING)**: Run the project's build and lint commands. Paste the terminal output in your response. If there are errors, fix them before proceeding. Do not launch review agents until the build is clean. Review agents cannot verify compilation — this step proves the code compiles.
2. Launch 3 code-reviewer agents in parallel with different focuses:
   - **Simplicity/DRY/elegance** — redundant code, unnecessary abstractions, overly complex logic
   - **Bugs/functional correctness** — logic errors, race conditions, missing error handling, infinite loop risks in hooks/effects, missing cleanup for subscriptions/timers
   - **Project conventions (CLAUDE.md compliance)** — check explicitly that all rules from the project's CLAUDE.md files are followed. Look for anti-patterns the CLAUDE.md files warn against.
3. Consolidate findings and identify highest severity issues that you recommend fixing
4. **Present findings to user and ask what they want to do** (fix now, fix later, or proceed as-is)
5. Address issues based on user decision

---

## Phase 7: Close-out (BLOCKING — do not say "done" until every step completes)

**Goal**: Capture lessons and document what was accomplished

**HARD GATE**: Do not summarize completion, say the feature is done, or respond to the user with a closing message until steps 1-3 are confirmed complete. If the user says "looks good" or "we're done" during Phase 6, acknowledge but proceed to Phase 7 before closing.

**Actions**:
1. **Observer agent (MANDATORY)**: Invoke the observer agent to review what was just built. After the agent returns, verify `tasks/lessons.md` was updated. Run `tail -5 tasks/lessons.md` and paste the output to confirm new entries were written. If `tasks/lessons.md` was not modified, tell the user: "Observer did not capture lessons — please review manually."
2. **End-of-Task Checklist** (all items BLOCKING):
   - If a new pattern was introduced → document in the relevant CLAUDE.md
   - If an architectural rule was confirmed or violated → update the appropriate CLAUDE.md
3. Mark all items in `tasks/todo.md` complete
4. Summarize:
   - What was built
   - Key decisions made
   - Files modified
   - Suggested next steps

---
