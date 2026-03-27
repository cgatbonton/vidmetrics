# Agent Splitting Strategies

How to decompose implementation work into parallel agents. Choose the strategy that best fits the task shape.

## Strategy 1: By Feature / Vertical Slice

Split when the task contains independent features that touch different parts of the codebase.

**When to use**: Multiple independent features, new pages/routes, distinct UI components with separate backends.

**Example**: "Build settings page with profile editing, notification preferences, and billing management"
- Agent 1: Profile editing (component + API route + hook)
- Agent 2: Notification preferences (component + API route + hook)
- Agent 3: Billing management (component + API route + hook)

**Risk**: Shared types or utilities may conflict. Mitigate by defining shared interfaces upfront in the prompt.

## Strategy 2: By Layer / Horizontal Slice

Split when a single feature spans multiple architectural layers that can be built independently.

**When to use**: One feature with clear layer boundaries (DB schema, API route, service logic, UI component, tests).

**Example**: "Add item duplication feature"
- Agent 1: Database schema changes + migration
- Agent 2: API route + service logic
- Agent 3: UI component + hook
- Agent 4: Tests

**Risk**: Layer dependencies (UI needs API types). Mitigate by building bottom-up — DB/API agents first, UI agent after.

## Strategy 3: By File / Module

Split when the task requires changes to many independent files.

**When to use**: Bulk refactors, migrations, applying a pattern across many files, updating imports/exports.

**Example**: "Add audit logging to all 12 API routes"
- Agent 1: Routes A, B, C
- Agent 2: Routes D, E, F
- Agent 3: Routes G, H, I
- Agent 4: Routes J, K, L

**Risk**: Low — files are independent. Best strategy for parallelism.

## Strategy 4: By Platform

Split when work spans multiple platform integrations with identical patterns.

**When to use**: Platform A + Platform B + Platform C features, multi-platform sync logic.

**Example**: "Add monitoring alerts for all platforms"
- Agent 1: Platform A alerts
- Agent 2: Platform B alerts
- Agent 3: Platform C alerts

**Risk**: Platform-specific gotchas. Include platform-specific documentation in each agent's prompt.

## Choosing a Strategy

| Task Shape | Best Strategy | Why |
|-----------|--------------|-----|
| "Build 3 new pages" | Feature | Pages are independent vertical slices |
| "Add a complex new feature" | Layer | Single feature, many layers |
| "Refactor 20 files to new pattern" | File | Same change, many targets |
| "Add X across all platforms" | Platform | Same feature, different APIs |
| Mixed | Combine | Use feature split at top level, layer split within |

## Anti-Patterns

- **Don't split tightly coupled work** — if Agent A's output is Agent B's input, run them sequentially
- **Don't split trivially small tasks** — 2-3 file changes don't need multiple agents
- **Don't forget shared state** — if agents touch the same file, one will overwrite the other. Assign clear file ownership
- **Don't skip the dependency check** — before splitting, identify shared types/utils and either: (a) create them first, or (b) assign them to one agent and make others depend on it
