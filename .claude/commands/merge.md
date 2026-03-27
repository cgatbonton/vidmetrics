---
allowed-tools: Bash(git:*), Bash(gh:*), Read, Edit, Glob, Grep, Agent
description: Create a PR, merge to target branch, then switch back
---

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status`
- Git diff (staged and unstaged): !`git diff HEAD`
- Recent commits on current branch: !`git log --oneline -10`

## Your Task

Execute a complete merge workflow based on the current branch.

### Step-by-Step Workflow

1. **Save the current branch name** for later restoration

2. **Commit and push changes** (if any uncommitted changes exist):
   - Stage all changes: `git add -A`
   - Create a commit with a descriptive message based on the changes
   - Push to remote: `git push -u origin <current-branch>`

3. **Pre-merge conflict check**:
   - Fetch the latest target branch: `git fetch origin <target-branch>`
   - Attempt a merge with `--no-commit --no-ff` to detect conflicts:
     ```bash
     git merge origin/<target-branch> --no-commit --no-ff
     ```
   - **If conflicts are detected:**
     - List all conflicted files
     - For each conflicted file, launch a subagent to resolve it:
       1. Read the file with conflict markers
       2. Understand both sides by checking recent commits on each branch
       3. Resolve by keeping both changes where possible, preferring semantic correctness
       4. Remove all conflict markers
       5. Stage the resolved file
     - After all conflicts resolved, verify no markers remain
     - Abort the test merge: `git merge --abort` (the PR merge handles the actual merge)
     - Commit the conflict resolutions on the current branch and push
   - **If no conflicts**: proceed to step 4

4. **Create a Pull Request**:
   - Use `gh pr create` to create a PR
   - Include a clear title and description summarizing the changes
   - If conflicts were resolved in step 3, note it in the PR description

5. **Merge the Pull Request**:
   - Use `gh pr merge` to merge the PR
   - Use squash merge strategy: `--squash`
   - Delete the remote branch after merge if it's not a long-lived branch: `--delete-branch`

6. **Switch back to the original branch**:
   - If the original branch was deleted, recreate it from the target: `git checkout -b <original-branch>`
   - If the original branch still exists, just switch back: `git checkout <original-branch>`
   - Pull latest changes: `git pull`

### Important Notes

- Always check for uncommitted changes before starting
- Pre-merge conflict check runs BEFORE creating the PR to avoid merge failures
- If conflict resolution fails or is too complex, stop and inform the user
- After completion, confirm the current branch matches the original working branch

### Error Handling

- If any step fails, stop immediately and report the error
- If the branch cannot be restored, inform the user of the current state
