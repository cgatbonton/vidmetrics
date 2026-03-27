---
allowed-tools: Bash(gh issue view:*), Bash(gh search:*), Bash(gh issue list:*), Bash(gh pr comment:*), Bash(gh pr diff:*), Bash(gh pr view:*), Bash(gh pr list:*)
description: Code review a pull request
---

Provide a code review for the given pull request.

**Agent assumptions (applies to all agents and subagents):**
- All tools are functional and will work without error. Do not test tools or make exploratory calls.
- Only call a tool if it is required to complete the task. Every tool call should have a clear purpose.

To do this, follow these steps precisely:

1. Launch a haiku agent to check if any of the following are true:
   - The pull request is closed
   - The pull request is a draft
   - The pull request does not need code review — skip ONLY if the diff contains fewer than 5 changed lines AND only touches documentation, comments, or string literals (no logic, API routes, or schema files)
   - Claude has already commented on this PR (check `gh pr view <PR> --comments` for comments left by claude or containing `## Code review`)

   If any condition is true, stop and do not proceed.

Note: Still review Claude generated PR's.

2. Launch a haiku agent to return a list of file paths (not their contents) for all relevant CLAUDE.md files including:
   - The root CLAUDE.md file, if it exists
   - Any CLAUDE.md files in directories containing files modified by the pull request

3. Launch a sonnet agent to view the pull request and return:
   - A summary of the changes
   - The number of files changed
   - Whether any API route files are added or modified
   - Whether any database schema files are modified

4. **If the PR has 10+ files**, group changed files by directory and launch one additional Sonnet agent per directory group to review that group's files in depth. Pass the PR summary as context to each.

5. Launch 4 agents in parallel to independently review the changes. Each agent should return the list of issues, where each issue includes a description and the reason it was flagged. The agents should do the following:

   Agents 1 + 2: CLAUDE.md compliance sonnet agents
   Audit changes for CLAUDE.md compliance in parallel. Note: When evaluating CLAUDE.md compliance for a file, you should only consider CLAUDE.md files that share a file path with the file or parents.

   Agent 3: Opus bug agent (parallel subagent with agent 4)
   Scan for obvious bugs. Focus only on the diff itself without reading extra context. Flag only significant bugs; ignore nitpicks and likely false positives.

   Agent 4: Opus bug agent (parallel subagent with agent 3)
   Look for problems that exist in the introduced code. This could be security issues, incorrect logic, etc. Only look for issues that fall within the changed code.

   **CRITICAL: We only want HIGH SIGNAL issues.** Flag issues where:
   - The code will fail to compile or parse
   - The code will definitely produce wrong results regardless of inputs
   - Clear, unambiguous CLAUDE.md violations where you can quote the exact rule being broken

   Do NOT flag:
   - Code style or quality concerns
   - Potential issues that depend on specific inputs or state
   - Subjective suggestions or improvements

   If you are not certain an issue is real, do not flag it.

6. For each issue found in the previous step by agents 3 and 4, launch parallel subagents to validate the issue. The agent's job is to review the issue to validate that the stated issue is truly an issue with high confidence. For CLAUDE.md violations, the validator should confirm (a) the rule exists verbatim in the linked CLAUDE.md, and (b) the violation is in *new* code, not pre-existing.

7. Filter out any issues that were not validated in step 6.

8. If issues were found, skip to step 9 to post inline comments directly.

   If NO issues were found, post a summary comment using `gh pr comment` (if `--comment` argument is provided):
   "No issues found. Checked for bugs and CLAUDE.md compliance."

9. Create a list of all comments that you plan on leaving. This is only for you to make sure you are comfortable with the comments. Do not post this list anywhere.

10. Post comments for each issue using `gh pr comment`. For each comment:
   - Provide a brief description of the issue
   - For small, self-contained fixes, include a code suggestion
   - For larger fixes, describe the issue and suggested fix without a code block

   **IMPORTANT: Only post ONE comment per unique issue. Do not post duplicate comments.**

Use this list when evaluating issues in Steps 5 and 6 (these are false positives, do NOT flag):

- Pre-existing issues
- Something that appears to be a bug but is actually correct
- Pedantic nitpicks that a senior engineer would not flag
- Issues that a linter will catch
- General code quality concerns unless explicitly required in CLAUDE.md
- Issues mentioned in CLAUDE.md but explicitly silenced in the code

Notes:

- Use gh CLI to interact with GitHub. Do not use web fetch.
- Create a todo list before starting.
- You must cite and link each issue in comments.
- If no issues are found, post a comment: "No issues found. Checked for bugs and CLAUDE.md compliance."
- When linking to code in comments, use the full GitHub URL format with full git sha and line range (L[start]-L[end]).
