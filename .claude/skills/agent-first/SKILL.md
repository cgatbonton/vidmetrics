---
name: agent-first
description: >
  Guide for building agent-first code in any project. Use when creating new features,
  API endpoints, components, services, database schemas, or refactoring existing code. Ensures
  every piece of code follows agent-first architecture: command layers, event emission, canonical
  state schemas, structured errors, composable actions, observable state, and audit logging.
  Triggers on new feature, new API route, new service, schema design, refactor, architecture decision.
---

# Agent-First Development Guide

Encode agent-first architecture patterns into every piece of code. The core philosophy: **build the agentic skeleton now, dress it in human clothes.** Every action a human takes through the UI should go through the same code path an agent would use via the API.

> **Note**: Code examples use TypeScript. Adapt to your project's language and framework.

## When to Use

Activate this skill when:

- Building a new feature, page, or component
- Creating or modifying an API endpoint
- Designing or modifying a database schema
- Creating a new service or business logic layer
- Refactoring existing code
- Making architecture decisions
- Building workflows that involve multiple steps
- Adding error handling or validation logic
- The user invokes `/agent-first` or asks to "make this agent-ready"

## Do NOT Use When

- Fixing a trivial typo or single-line bug
- Updating styling/CSS-only changes with no logic
- Writing tests for existing (already agent-ready) code
- The task is purely about UI polish with no state or action changes

## Workflow

### Step 1: Classify the Work

**Before writing any code:**
1. Classify what is being built:

| Building... | Key agent-first concerns |
|------------|------------------------|
| API endpoint | Command layer, structured errors, audit logging, event emission |
| Database schema | Canonical state schema with agentic slots, constraints field |
| UI component | Consumes same API agents will use, captures behavioral data |
| Service/business logic | Atomic actions, composable workflows, permission checks |
| Workflow (multi-step) | No hardcoded sequences, each step independent and reversible |

### Step 1b: Verify UI-Route Parity

For any feature that includes both UI and API routes, verify **parity** — the UI must go through the AF API routes, never bypass them with direct database/service calls.

| Check | Pass criteria |
|-------|--------------|
| UI mutations use API calls (`fetch('/api/...')` or equivalent) | No direct DB calls in client code for this feature |
| Every UI action has a corresponding AF route | No orphan mutations that skip the API layer |
| AF route covers all operations the UI performs | CRUD parity — if the UI can create, read, update, delete, the route supports all four |
| Response shape consumed correctly | UI reads `constraints` and `nextActions` from the AF response (or has a plan to) |

**Why this matters**: If the UI bypasses the API, agents can't do what humans can. The whole point of agent-first is one code path for both. A missing route means an agent has no way to perform that action. A direct DB call means mutations happen without actor attribution, audit logging, or event emission.

### Step 2: Apply Core Principles

Load `references/core-principles.md` for the full 10 principles with code examples.

For every piece of code, verify these **non-negotiable Phase 1 requirements**:

1. **Command Layer** — Every action goes through a structured command with actor attribution
2. **Event Emission** — Every state change emits a structured event (even if nothing listens). **Not optional in Phase 1.** Emit failure events too: `type = 'domain.action_failed'`. For bulk operations, emit per entity, not per batch. Low-salience events (preferences updated, settings changed) still get emitted — the overhead is one function call.
3. **Canonical State** — Every entity has a complete state schema with slots for future agentic data
4. **Structured Errors** — Every error includes code + reason + remediation. This applies to ALL error sources:
   - **Validation errors**: Wrap validation library errors into structured format with code, reason, and remediation
   - **External API errors**: Wrap third-party errors — never forward raw error objects
   - **Bulk partial failures**: Each failed item gets its own `{ id, code, reason, remediation }`, not a bare string in an errors array
5. **Composable Actions** — No hardcoded step sequences; each action is atomic and reversible
6. **Audit Trail** — Every mutation logs who, what, when, why. **auditLog() must be called on ALL exit paths** — auth failure, validation failure, not-found, AND success. On failure paths: `outcome: { success: false, error: { code, reason } }`. This is not optional.

### Step 3: Apply Patterns

Load `references/patterns.md` for concrete code patterns including:

- Command layer pattern (API routes)
- Event emission pattern
- Canonical state schema pattern
- Structured error response pattern
- Audit log pattern
- Composable action pattern

**Constraints & NextActions (required on every response):**

Every AF route response MUST include `constraints` and `nextActions`, even for simple entities. Use these minimal stubs when full implementation isn't warranted yet:

```typescript
// Mutation response (single entity)
return jsonResponse({
  ...updatedEntity,
  constraints: { canEdit: true, canDelete: entity.status !== 'ACTIVE' },
  nextActions: getNextActions(updatedEntity),
});

// Minimal stubs (Phase 1 acceptable):
function getConstraints(entity: any) {
  return { canEdit: true, canDelete: true, canArchive: true };
}
function getNextActions(entity: any) {
  return []; // Phase 2+: derive from entity state machine
}

// List/GET response (wrap the array in an envelope):
return jsonResponse({
  data: filteredEntities,
  total: count,
  constraints: { canCreate: true },
  nextActions: ['create'],
});
```

**No exceptions**: Configuration entities (preferences, settings) get `constraints: { canEdit: true }` and `nextActions: []`. The overhead is one line — never skip it.

### Step 4: Check Against Phase 1 Checklist

Load `references/phase1-checklist.md` for the complete checklist of what must be present in Phase 1 code.

Run through the checklist before marking any feature complete:

- [ ] Actions go through command layer with actor attribution
- [ ] State changes emit events
- [ ] Entity schemas have agentic data slots (tags, scores, performance, constraints)
- [ ] UI consumes the API (not direct database calls or server functions)
- [ ] UI-route parity verified — every UI mutation has a corresponding AF route, no orphan operations
- [ ] Errors are structured (code + reason + remediation)
- [ ] Audit log captures who did what, when, why
- [ ] Permission infrastructure exists (even if everyone is admin)
- [ ] Workflows are composable (no hardcoded step sequences)
- [ ] Behavioral data is captured structured (user clicks, decisions)
- [ ] Suggestions include "why" explanations

### Bulk Operation Contract

For any route that accepts an array of entities (bulk update, bulk delete, bulk status change):

```typescript
// Response shape for bulk operations:
interface BulkResult<T> {
  succeeded: Array<T & { constraints: object; nextActions: string[] }>;
  failed: Array<{ id: string; code: string; reason: string; remediation: string }>;
  constraints: { canRetryFailed: boolean };
  nextActions: string[];
}

// Per-entity requirements inside the bulk loop:
for (const item of items) {
  try {
    const result = await updateEntity(item);
    emitEvent({ type: 'entity.updated', entityId: item.id, ... }); // per entity
    auditLog({ actor, action: 'update', targetId: item.id, ... }); // per entity
    succeeded.push(result);
  } catch (error) {
    auditLog({ actor, action: 'update', targetId: item.id, outcome: { success: false, error } });
    failed.push({ id: item.id, code: 'UPDATE_FAILED', reason: error.message, remediation: '...' });
  }
}
```

**Rule**: Emit one `emitEvent()` and one `auditLog()` PER ENTITY, not per batch. Aggregate events lose the granularity that makes the audit trail useful.

### GET Route Pattern

Read routes also follow AF principles. They need:
1. **Actor extraction** for scoping and permission checks (same `getActor()`)
2. **Structured errors** on 401/403/404 (same `{ code, reason, remediation }`)
3. **Response envelope** with constraints so callers know what mutations are available:
```typescript
return jsonResponse({
  data: filteredEntities,
  total: count,
  page, pageSize,
  constraints: { canCreate: actor.permissions.includes('create') },
  nextActions: ['create', 'export'],
});
```

### Step 5: Review for Anti-Patterns

Reject code that violates these rules:

| Anti-Pattern | Fix |
|-------------|-----|
| UI button calls server function directly | Route through API endpoint with command structure |
| Error returns only a string message | Return `{ code, reason, remediation }` |
| Hardcoded workflow: step1 → step2 → step3 | Make each step an independent atomic action |
| Unstructured data stored as free text | Parse into structured, queryable fields |
| No actor attribution on mutations | Add `actor: { type, id, humanPrincipal }` to every command |
| Missing event emission on state change | Add event emit after every successful mutation |
| Schema missing constraints/nextActions | Add `constraints` and `nextActions` fields |
| Two separate code paths for human vs agent | One code path, same API for both |
| UI calls database directly for mutations | Route through AF API endpoint; UI uses API calls |
| UI can do something agents can't (missing route) | Add AF route for every UI mutation; verify CRUD parity |

## Trust Ladder Reference

Load `references/trust-ladder.md` for the full autonomy progression framework:

- Level 0: MANUAL → Level 1: INFORMED → Level 2: ASSISTED → Level 3: SUPERVISED → Level 4: AUTONOMOUS → Level 5: STRATEGIC

Design every feature to support progression up this ladder without architectural changes.

## Error Handling

| Error | Recovery |
|-------|----------|
| Feature lacks command layer | Wrap the action in a command structure with actor, action, target fields |
| No event emission found | Add event emit call after the mutation succeeds |
| Schema missing agentic slots | Add nullable columns for tags, scores, performance, constraints |
| Hardcoded workflow detected | Decompose into atomic actions callable independently |
| Error response is unstructured | Wrap in `{ code: string, reason: string, remediation: string }` |
