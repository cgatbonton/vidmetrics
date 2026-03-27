# Agent-First Code Patterns

Concrete code patterns for agent-first development. Examples use TypeScript — adapt to your project's language, framework, and ORM.

---

## Pattern 1: Command Layer (API Routes)

Every API route wraps mutations in a command structure with actor attribution.

```typescript
// api/entities/[id]/pause/route.ts
import { z } from "zod"; // or your validation library
import { emitEvent } from "@/lib/events";
import { auditLog } from "@/lib/audit";
import { checkPermission } from "@/lib/permissions";

const PauseCommandSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const actor = await getActor(req); // extracts from session or API key
  const body = await req.json();
  const command = PauseCommandSchema.parse(body);

  // 1. Check permissions
  const allowed = await checkPermission(actor, "entity.pause", params.id);
  if (!allowed) {
    return jsonResponse(
      {
        code: "PERMISSION_DENIED",
        reason: "Actor lacks entity.pause permission",
        remediation: "Request entity.pause permission from org admin",
      },
      { status: 403 }
    );
  }

  // 2. Validate state transition
  const entity = await getEntity(params.id);
  if (entity.status !== "active") {
    return jsonResponse(
      {
        code: "INVALID_STATE_TRANSITION",
        reason: `Cannot pause entity in '${entity.status}' state`,
        remediation: "Entity must be in 'active' state to pause",
      },
      { status: 422 }
    );
  }

  // 3. Execute atomic action
  const updated = await updateEntityStatus(params.id, "paused");

  // 4. Emit event
  await emitEvent({
    type: "entity.status_changed",
    entityId: params.id,
    data: { priorState: "active", newState: "paused" },
  });

  // 5. Audit log
  await auditLog({
    actor,
    action: "entity.pause",
    target: params.id,
    reason: command.reason,
    outcome: { success: true, priorState: "active", newState: "paused" },
  });

  // 6. Return canonical state
  return jsonResponse({
    ...updated,
    constraints: getConstraints(updated),
    nextActions: getNextActions(updated),
  });
}
```

---

## Pattern 2: Event Emission

Every state change emits a structured event. In Phase 1, events go to a log table. In Phase 2+, they trigger webhooks.

```typescript
// lib/events/index.ts
import { db } from "@/lib/db";

interface EventPayload {
  type: string;
  entityId: string;
  data: Record<string, unknown>;
  suggestedActions?: string[];
}

export async function emitEvent(payload: EventPayload): Promise<void> {
  // Phase 1: Log to database
  await db.events.create({
    type: payload.type,
    entityId: payload.entityId,
    data: payload.data,
    suggestedActions: payload.suggestedActions ?? [],
    timestamp: new Date().toISOString(),
  });

  // Phase 2+: Dispatch to webhook subscribers
  // await dispatchWebhooks(payload);
}
```

---

## Pattern 3: Canonical State Schema

Every entity table includes agentic data slots from day one — nullable columns that will be populated in later phases.

```typescript
// db/schema.ts — example entity with agentic slots

// Example: resources table with agentic slots
const resources = defineTable("resources", {
  id: uuid().primaryKey(),
  type: text().notNull(), // e.g., "document" | "image" | "template"
  status: text().notNull().default("draft"),

  // Core data
  name: text().notNull(),
  fileUrl: text(),
  metadata: json(), // dimensions, format, etc.

  // Relationships
  projectId: uuid().references("projects.id"),
  organizationId: uuid().notNull(),

  // === AGENTIC SLOTS (nullable, populated in later phases) ===
  tags: json().default([]),              // Phase 2: domain-specific tags
  scores: json(),                         // Phase 2: predictive performance scores
  performance: json(),                    // Populated when entity is active
  editHistory: json().default([]),        // Track all edits
  constraints: json().default({           // What can be done with this entity
    canEdit: true,
    canPublish: true,
    canDelete: true,
  }),

  // Timestamps
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
```

**Key rule**: The schema has slots for `tags`, `scores`, `performance` even in Phase 1 where they're empty/null. When advanced tagging arrives in Phase 2, add data to existing fields — no schema migration needed.

---

## Pattern 4: Structured Error Responses

Every error response includes machine-readable code, human-readable reason, and actionable remediation.

```typescript
// lib/errors/index.ts

interface StructuredError {
  code: string;        // machine-readable: "LIMIT_EXCEEDED", "INVALID_STATE"
  reason: string;      // human-readable: "Resource limit of 500 has been exceeded"
  remediation: string; // actionable: "Delete unused resources or upgrade plan"
}

// Common error factory
export function createError(
  code: string,
  reason: string,
  remediation: string,
  httpStatus: number = 400
) {
  return jsonResponse(
    { code, reason, remediation } satisfies StructuredError,
    { status: httpStatus }
  );
}

// Usage in API routes
return createError(
  "RESOURCE_LIMIT_REACHED",
  "Organization has reached the maximum of 500 resources",
  "Delete unused resources or upgrade to a higher tier"
);

// Pre-defined error catalog
export const ERRORS = {
  PERMISSION_DENIED: (action: string) => ({
    code: "PERMISSION_DENIED",
    reason: `Actor lacks ${action} permission`,
    remediation: `Request ${action} permission from org admin`,
  }),
  INVALID_STATE_TRANSITION: (current: string, target: string) => ({
    code: "INVALID_STATE_TRANSITION",
    reason: `Cannot transition from '${current}' to '${target}'`,
    remediation: `Entity must be in a valid state for this transition`,
  }),
  ENTITY_NOT_FOUND: (type: string, id: string) => ({
    code: "ENTITY_NOT_FOUND",
    reason: `${type} with ID '${id}' not found`,
    remediation: `Verify the ${type} ID is correct and belongs to this organization`,
  }),
  RATE_LIMITED: (limit: string) => ({
    code: "RATE_LIMITED",
    reason: `Rate limit exceeded: ${limit}`,
    remediation: `Wait before retrying or upgrade to a higher tier`,
  }),
} as const;
```

---

## Pattern 5: Audit Log

Every mutation is logged with full actor attribution and context.

```typescript
// lib/audit/index.ts
import { db } from "@/lib/db";

interface AuditEntry {
  actor: {
    type: "human" | "agent" | "system";
    id: string;
    humanPrincipal?: string;
  };
  action: string;
  target: string;
  reason?: string;
  context?: {
    triggeredBy?: string;
    decisionModel?: string;
    alternativesConsidered?: string[];
    confidence?: number;
  };
  outcome: {
    success: boolean;
    priorState?: string;
    newState?: string;
    error?: { code: string; reason: string };
  };
}

export async function auditLog(entry: AuditEntry): Promise<void> {
  await db.auditLogs.create({
    timestamp: new Date().toISOString(),
    actorType: entry.actor.type,
    actorId: entry.actor.id,
    humanPrincipal: entry.actor.humanPrincipal,
    action: entry.action,
    target: entry.target,
    reason: entry.reason,
    context: entry.context,
    outcome: entry.outcome,
  });
}
```

---

## Pattern 6: Actor Extraction

Unified actor extraction that works for both human sessions and agent API keys.

```typescript
// lib/auth/get-actor.ts

interface Actor {
  type: "human" | "agent" | "system";
  id: string;
  humanPrincipal?: string;
}

export async function getActor(req: Request): Promise<Actor> {
  // Check for agent API key first
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) {
    const agent = await validateAgentApiKey(apiKey);
    return {
      type: "agent",
      id: agent.agentId,
      humanPrincipal: agent.owner,
    };
  }

  // Fall back to human session (adapt to your auth provider)
  const session = await getSession(req);
  if (session?.user) {
    return { type: "human", id: session.user.id };
  }

  // System actions (cron jobs, webhooks)
  const systemToken = req.headers.get("x-system-token");
  if (systemToken && systemToken === process.env.SYSTEM_TOKEN) {
    return { type: "system", id: "system" };
  }

  throw new Error("Unauthorized: no valid actor");
}
```

---

## Pattern 7: Composable Workflows

Never hardcode step sequences. Each step is an independent function that can be called in any order.

```typescript
// BAD: Hardcoded workflow
async function launchEntity(data: EntityData) {
  const entity = await createEntity(data.entity);
  await uploadResources(entity.id, data.resources);  // must happen after create
  await setConfig(entity.id, data.config);            // must happen after create
  await setAllocation(entity.id, data.allocation);    // must happen after create
  await activateEntity(entity.id);                    // must happen last
}

// GOOD: Composable atomic actions
// Each action is independently callable
export const entityActions = {
  create: async (params: CreateParams) => { /* ... */ },
  uploadResources: async (id: string, resources: Resource[]) => { /* ... */ },
  setConfig: async (id: string, config: Config) => { /* ... */ },
  setAllocation: async (id: string, allocation: Allocation) => { /* ... */ },
  activate: async (id: string) => { /* ... */ },
};

// Orchestration layer composes them (declarative endpoint)
export async function executeDeclarativePlan(
  goal: string,
  desiredState: Record<string, unknown>
) {
  const plan = buildPlan(goal, desiredState); // determines steps
  const results = [];

  for (const step of plan) {
    try {
      const result = await entityActions[step.action](step.params);
      results.push({ step: step.action, success: true, result });
    } catch (error) {
      results.push({ step: step.action, success: false, error });
      // Can retry, skip, or rollback based on policy
      break;
    }
  }

  return { plan: plan.map(s => s.action), results };
}
```

---

## Pattern 8: Behavioral Data Capture

Capture user interaction data in structured form for future agent training.

```typescript
// lib/behavioral-data/index.ts

interface BehavioralEvent {
  userId: string;
  sessionId: string;
  event: string; // "item_selected", "suggestion_dismissed", "edit_applied"
  entityType: string;
  entityId: string;
  data: Record<string, unknown>; // event-specific structured data
  timestamp: string;
  pageUrl: string;
  timeOnPage?: number; // milliseconds
}

export async function captureBehavior(event: BehavioralEvent): Promise<void> {
  await db.behavioralEvents.create(event);
}

// Client-side hook for React components (adapt to your UI framework)
export function useBehaviorCapture(entityType: string, entityId: string) {
  const capture = useCallback(
    (event: string, data: Record<string, unknown> = {}) => {
      fetch("/api/behavioral-events", {
        method: "POST",
        body: JSON.stringify({ event, entityType, entityId, data }),
      });
    },
    [entityType, entityId]
  );

  return { capture };
}
```

---

## Pattern 9: UI-Route Parity

Every UI mutation must go through an AF API route. The UI never calls the database directly for mutations — this ensures agents have the same capabilities as humans.

### What parity means

```
UI Action                    →  AF API Route
─────────────────────────────────────────────────
Create draft                 →  POST /api/drafts
Update draft                 →  PUT  /api/drafts/[draftId]
Delete draft                 →  DELETE /api/drafts/[draftId]
Toggle setting on/off        →  PUT  /api/settings/[settingId]
Export data                  →  POST /api/export
```

### Correct pattern (UI hooks call AF routes)

```typescript
// hooks/useDraftManager.ts — CORRECT
// All mutations go through the AF API route

async function saveDraft(name: string, config: Record<string, unknown>) {
  const res = await fetch('/api/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organizationId, name, config }),
  });
  const data = await res.json();
  // AF route returns constraints + nextActions
  return data;
}

async function deleteDraft(draftId: string) {
  await fetch(`/api/drafts/${draftId}?organizationId=${orgId}`, {
    method: 'DELETE',
  });
}
```

### Anti-pattern (UI bypasses AF route)

```typescript
// hooks/useDraftManager.ts — WRONG
// Direct DB call bypasses actor attribution, audit, events

async function saveDraft(name: string, config: Record<string, unknown>) {
  const { data, error } = await db
    .from('user_settings')
    .insert({
      user_id: userId,
      setting_key: name,
      setting_type: 'draft',
      setting_value: { organizationId, config },
    });
  // No actor attribution, no audit log, no event emission
  // An agent using the API cannot replicate this action
  return data;
}
```

### How to verify parity

For any new feature, run this audit:

1. **List all UI mutations** — grep hooks/components for direct DB mutations
2. **List all AF routes** — check your API route directory for this feature's domain
3. **Match them** — every UI mutation must map to an AF route
4. **Check for orphans** — any UI mutation without a route is a parity gap

```bash
# Quick check: no direct DB mutations in client hooks for a domain
# Adapt the pattern to match your DB client (e.g., prisma, drizzle, knex, etc.)
grep -r "db\..*\.insert\|db\..*\.update\|db\..*\.delete" \
  hooks/ components/ --include="*.ts" --include="*.tsx"
# Results should be empty for any domain that has AF routes
```
