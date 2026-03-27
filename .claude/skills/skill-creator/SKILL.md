---
name: skill-creator
description: >
  Guide for creating, validating, and packaging skills that extend Claude's capabilities.
  This skill should be used when users want to create a new skill, update an existing skill,
  validate a skill, or package a skill for distribution. Key capabilities include scaffolding
  skill directories, writing effective SKILL.md files, and running validation checks.
---

# Skill Creator

This skill provides step-by-step guidance for creating effective skills — modular packages that extend Claude's capabilities with specialized knowledge, workflows, and tools.

## About Skills

Skills are self-contained packages built around a `SKILL.md` file with optional bundled resources (`scripts/`, `references/`, `assets/`). They use progressive disclosure: metadata is always in context, SKILL.md loads when triggered, and bundled resources load on demand.

For the full anatomy, naming rules, frontmatter spec, and constraints, load `references/technical-requirements.md`.

## Skill Creation Process

Follow these steps in order. Skip a step only when there is a clear reason it does not apply.

### Step 1: Understand the Skill with Concrete Examples

**Skip ONLY if** the user's initial request already includes: (a) specific functionality, (b) 3+ example trigger prompts, AND (c) clear scope boundaries. If any of these are missing, ask.

To create an effective skill, clearly understand concrete examples of how the skill will be used. This understanding can come from direct user examples or generated examples validated with user feedback.

**MANDATORY**: Before proceeding to Step 2, present to the user:
1. At least 3 candidate trigger prompts ("phrases that should invoke this skill")
2. At least 2 non-trigger prompts ("phrases that should NOT invoke this skill")
3. A one-sentence scope summary ("this skill does X but not Y")

Get user confirmation on all three. Avoid overwhelming users — keep questions focused.

Example questions for an image-editor skill:
- "What functionality should the image-editor skill support? Editing, rotating, anything else?"
- "Can you give some examples of how this skill would be used?"
- "What would a user say that should trigger this skill?"

**Exit criteria**: User-confirmed trigger prompts, non-trigger prompts, and scope summary.

### Step 2: Plan the Reusable Skill Contents

Turn concrete examples into a skill by analyzing each example:

1. Consider how to execute on the example from scratch
2. Identify what scripts, references, and assets would be helpful when executing these workflows repeatedly

**Planning examples**:

| Example Task | Analysis | Resource |
|-------------|----------|----------|
| "Rotate this PDF" | Same rotation code every time | `scripts/rotate_pdf.py` |
| "Build me a todo app" | Same boilerplate every time | `assets/hello-world/` template |
| "How many users logged in?" | Same schema discovery every time | `references/schema.md` |

For architectural patterns (sequential orchestration, multi-MCP coordination, iterative refinement, context-aware tool selection, domain-specific intelligence), load `references/skill-patterns.md`.

**Exit criteria**: Present a resource table to the user listing each planned file with its path, purpose, and whether it's a script, reference, or asset. Get user confirmation before proceeding. Do NOT begin writing SKILL.md until resources are confirmed.

Example output:
```
| Resource | Type | Purpose |
|----------|------|---------|
| scripts/scan.py | script | Scan files for pattern matches |
| references/patterns.md | reference | Known patterns to check against |
```

### Step 3: Initialize the Skill

Skip if the skill already exists and only iteration or packaging is needed.

When creating a new skill from scratch, run the `init_skill.py` script to scaffold the directory:

```bash
python3 scripts/init_skill.py <skill-name> --path <output-directory>
```

**Expected output**:

```
Success! Skill 'my-skill' created at: <output-directory>/my-skill

Created structure:
  my-skill/
  ├── SKILL.md              (edit frontmatter and instructions)
  ├── scripts/
  │   └── example.py        (replace or delete)
  ├── references/
  │   └── example.md        (replace or delete)
  └── assets/
      └── .gitkeep          (add output assets here)
```

The script validates that the name is kebab-case and contains no forbidden words ("claude", "anthropic"). After initialization, customize or remove the generated template files as needed.

### Step 4: Edit the Skill

When editing a skill (newly generated or existing), remember the skill is being created for another instance of Claude. Focus on procedural knowledge, domain-specific details, and reusable assets that would help another Claude instance execute tasks more effectively.

#### Start with Bundled Resources

Begin implementation with the reusable resources identified in Step 2: `scripts/`, `references/`, and `assets/` files. This step may require user input (e.g., brand assets, API documentation, templates).

Delete any example files from initialization that are not needed.

#### Write SKILL.md

Structure SKILL.md following this recommended outline:

1. **Frontmatter** — `name` (kebab-case) and `description` (what + when + capabilities)
2. **Title and purpose** — 1-2 sentence overview
3. **When to Use** — Specific trigger conditions
4. **Do NOT Use When** — Anti-patterns and out-of-scope requests
5. **Workflow** — Numbered steps with script/reference callouts
6. **Error Handling** — Common failure modes and recovery steps
7. **Output format** — What the final deliverable looks like (if applicable)
8. **References** — Pointers to bundled resources with context for when to load them

For the description formula (What + When + Capabilities), good/bad examples, and trigger optimization, load `references/description-guide.md`.

For naming rules, frontmatter field constraints, and the full technical spec, load `references/technical-requirements.md`.

#### Writing Style

Write all instructions using **imperative/infinitive form** (verb-first), not second person. Use objective, instructional language:

**Good**: "To rotate a PDF, execute `scripts/rotate_pdf.py` with the file path."
**Bad**: "You should run the rotation script on the PDF file."

#### Actionability Rule

Every instruction should be actionable — Claude must be able to execute it without guessing. Avoid vague directives.

**Good**: "Load `references/schema.md` and identify the table matching the user's query."
**Bad**: "Consult the relevant documentation as needed."

#### Negative Triggers

Include a "Do NOT Use When" section to prevent false activations:

```markdown
## Do NOT Use When

- The user is asking about general coding help (not skill-specific)
- The request is for a one-off task that doesn't need reusability
- Another skill already handles the requested functionality
```

#### Resource References

Every bundled resource must be explicitly referenced in the SKILL.md workflow. Use this phrasing pattern:

- `Load references/file.md for [specific context]`
- `Execute scripts/tool.py with [arguments]`
- `Copy assets/template/ to [destination]`

### Step 5: Validate (MANDATORY) and Package (optional)

**BLOCKING**: Do NOT proceed to Step 6 until validation passes.

#### Step 5a: Validate

Run `package_skill.py` for automated validation:

```bash
python3 scripts/package_skill.py <path/to/skill-folder>
```

If the script is unavailable, manually verify these 5 rules:

1. [ ] `SKILL.md` exists with exact casing
2. [ ] YAML frontmatter present with `---` delimiters
3. [ ] `name` field exists, is kebab-case, has no forbidden words ("claude", "anthropic")
4. [ ] `description` field exists, has no XML angle brackets
5. [ ] Folder name is kebab-case

Also check these quality signals (non-blocking but recommended fixes):
- Folder name matches frontmatter `name`
- Description under 1024 characters
- Description includes trigger conditions ("should be used when")
- SKILL.md under 5000 words
- No README.md in skill folder

#### Step 5b: Package (optional)

If the user wants a distributable package, the same script creates `<skill-name>.zip`:

```bash
python3 scripts/package_skill.py <path/to/skill-folder> --output ./dist
```

### Step 6: Trigger Testing (MANDATORY)

**BLOCKING**: Do NOT report the skill as complete until this step is done.

Before finishing, list and present to the user:
- **3+ activating prompts** — phrases that SHOULD trigger this skill
- **2+ non-activating prompts** — phrases that SHOULD NOT trigger this skill

Verify each prompt against the skill's `description`, `When to Use`, and `Do NOT Use When` sections. If any trigger behaves unexpectedly, revise those sections before finishing.

#### Additional Quality Checks (recommended but not blocking)

1. **Workflow test** — Execute a full workflow and verify all steps are followed
2. **Edge case test** — Test with unusual inputs or error conditions
3. **Comparison test** — Compare output quality with and without the skill

#### Iteration Signals

**Undertriggering** (skill doesn't activate when it should):
- Add more trigger scenarios and synonyms to the description
- Include user-friendly language alongside technical terms
- Expand "When to Use" with more conditions

**Overtriggering** (skill activates when it shouldn't):
- Narrow the description scope with more specific conditions
- Strengthen the "Do NOT Use When" section
- Replace generic trigger words with domain-specific terms

**Instructions not followed** (skill activates but behaves incorrectly):
- Add concrete examples and expected outputs to workflow steps
- Break complex steps into smaller sub-steps
- Add explicit script/reference callouts where Claude is improvising

For the full testing methodology, success metrics, and performance baselines, load `references/testing-and-iteration.md`.

For problem/solution tables and phase-by-phase checklists, load `references/troubleshooting-checklist.md`.

### Step 7: Classify and Optimize (Conditional)

**MANDATORY classification**: Before finishing, explicitly state whether this skill is:
- **Procedural** (scaffolding, formatting, orchestration, file manipulation) → skip optimization, note "Step 7: Procedural skill — autoresearch not applicable"
- **Non-procedural** (generation, analysis, decision-making, scoring, search/retrieval) → offer optimization

Non-procedural examples:
- Generation skills (ad copy, reports, analysis) — output quality varies by prompt phrasing
- Decision skills (policy analysis, scoring, classification) — accuracy varies by rubric structure
- Search/retrieval skills (KB search, matching) — relevance varies by parameters

**If non-procedural**, you MUST suggest: "This skill produces variable-quality output. Run `/autoresearch-skills` to optimize it?"

**If user accepts**:
1. Identify the artifact to optimize (usually the core prompt or scoring logic in SKILL.md)
2. Define 3-6 binary scoring criteria based on the skill's success metrics from Step 6
3. Run `/autoresearch-skills` with the skill file as the mutable artifact, using 5 rounds default
4. Review results and accept or revert
