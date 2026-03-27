# Agent-First Core Principles

These 10 principles govern all architecture decisions in an agent-first platform.

---

## 1. State Should Be Observable, Not Hidden

Every entity must have a **canonical state representation** that is machine-readable. The state schema includes the entity's current values, constraints on what can happen next, and suggested next actions.

```typescript
// Canonical state schema for any entity
interface EntityState<T> {
  id: string;
  status: string; // e.g., "draft" | "active" | "paused" | "ended"
  data: T; // entity-specific fields
  constraints: {
    canEdit: boolean;
    canDelete: boolean;
    canPublish: boolean;
    requiresApproval: boolean;
    [key: string]: boolean;
  };
  nextActions: string[]; // e.g., ["pause", "edit", "archive"]
}
```

**Why**: An agent can reason about what's possible without trial-and-error. The API tells it "here's what you can do next" rather than forcing it to guess. The same state model drives both the UI (enable/disable buttons) and the agent (available actions).

---

## 2. Actions Should Be Atomic and Composable

Define a **Core Action Vocabulary** where each action is a distinct, reversible operation. Agents compose them into workflows.

```
Entity Actions:
- entity.create(params) → returns draft entity
- entity.update(id, fields) → returns updated entity
- entity.activate(id) → transitions draft→active
- entity.pause(id) → transitions active→paused
- entity.delete(id) → soft-deletes draft/paused entity

Resource Actions:
- resource.upload(file, metadata) → returns resource asset
- resource.generate(configId, params) → triggers generation, returns job ID
- resource.edit(id, operations) → applies edits
- resource.score(id) → returns predicted performance (Phase 2)

Budget/Allocation Actions:
- allocation.set(entityId, amount, limits)
- allocation.reallocate(fromEntityId, toEntityId, amount)
- allocation.schedulePacing(entityId, schedule)

Analytics Actions:
- analytics.query(entityId, metrics, timeRange) → performance data
- analytics.compare(entityIds, metric) → comparative analysis
- analytics.anomalies(entityId) → outliers/alerts
```

**Why**: Agents build custom workflows by composing primitives. "Pause underperformers, double down on winners" = `analytics.query` + `entity.pause` + `allocation.reallocate`. No new endpoint needed.

---

## 3. Context Should Be Pushable, Not Just Pullable

Implement a **webhook/event system** where agents subscribe to events and get notified when relevant state changes occur.

```typescript
// Event types to emit
type EventType =
  | "entity.status_changed"       // draft→active, active→paused
  | "entity.threshold_reached"    // 80% capacity, limit hit
  | "entity.performance_anomaly"  // key metric drops significantly
  | "resource.generation_complete" // async job finished
  | "resource.performance_milestone" // significant threshold reached
  | "analytics.opportunity_detected"; // underutilized resource, trend

// Webhook payload structure
interface WebhookPayload {
  event: EventType;
  timestamp: string;
  data: {
    entityId: string;
    // event-specific data
    [key: string]: unknown;
  };
  suggestedActions: string[]; // what the agent might want to do next
}
```

**Why**: Agents react in real-time without polling. The webhook payload includes actionable context (current performance, suggested next steps) so the agent doesn't need follow-up API calls.

---

## 4. Interfaces Should Be Declarative, Not Imperative

Support **goal-based API endpoints** where agents describe the desired end state, and the platform figures out the steps.

```typescript
// Declarative endpoint
// POST /entities/declarative
interface DeclarativeRequest {
  goal: string; // e.g., "launch_entity"
  desired_state: {
    name: string;
    status: "active";
    resources: ResourceData[];
    config: ConfigParams;
    allocation: AllocationConfig;
  };
}

// Response includes the execution plan
interface DeclarativeResponse {
  plan: string[]; // ["Create draft", "Upload resources", "Set config", ...]
  estimatedTime: string;
  confirmRequired: boolean;
  execute: boolean;
}
```

**Why**: Agents describe intent, platform handles sequencing, dependencies, and error recovery. If step 3 fails, the platform can retry or rollback automatically.

---

## 5. Capabilities Should Be Discoverable

Implement a **capabilities endpoint** that agents call on startup to learn what the platform can do.

```typescript
// GET /capabilities
interface CapabilitiesResponse {
  version: string;
  actions: {
    [domain: string]: {
      [action: string]: {
        description: string;
        parameters: Record<string, unknown>;
        requiredPermissions: string[];
        rateLimits: string;
      };
    };
  };
  events: {
    [eventType: string]: {
      description: string;
      payload_schema: Record<string, unknown>;
    };
  };
  constraints: {
    [action: string]: Record<string, unknown>;
  };
}
```

**Why**: No hardcoded assumptions. When the platform adds a new action (e.g., `resource.score` in Phase 2), agents discover it automatically. Documentation never drifts because it's generated from the live endpoint.

---

## 6. Observability Should Be First-Class

Every API call, state change, and decision must be logged with full attribution.

```typescript
interface AuditLogEntry {
  timestamp: string;
  actor: {
    type: "human" | "agent" | "system";
    id: string; // user ID or agent ID
    humanPrincipal?: string; // who authorized this agent
  };
  action: string; // e.g., "entity.pause"
  target: string; // e.g., "ent_abc123"
  reason?: string; // "metric dropped below 2.0 threshold"
  context?: {
    triggeredBy?: string; // event that triggered this
    decisionModel?: string; // rule or model that decided
    alternativesConsidered?: string[];
    confidence?: number;
  };
  outcome: {
    success: boolean;
    priorState?: string;
    newState?: string;
    error?: StructuredError;
  };
}
```

**Why**: Debugging ("why did the agent pause my entity?"), trust (humans see what agents do), compliance (full attribution trail), and learning (analyze agent decision patterns).

---

## 7. Guardrails Should Be Configurable, Not Hardcoded

Implement a **permission + constraint system** with configurable policies per agent/user.

```typescript
interface AgentPolicy {
  agentId: string;
  owner: string;
  permissions: {
    [domain: string]: {
      [action: string]: boolean | {
        allowed: boolean;
        maxAmount?: string; // e.g., "20%" for increases
        requiresApproval?: boolean;
        maxPerDay?: number;
      };
    };
  };
  autonomyLevel: {
    default: "co-pilot" | "autonomous" | "suggest";
    overrides: Record<string, string>;
  };
  resourceLimits: {
    maxDailyUsage: number;
    maxTotalAuthorized: number;
    alertThresholds: number[];
  };
}
```

**Why**: Different agents and humans have different risk tolerances. New users start in "suggest" mode. As trust builds, they increase autonomy. Power users give agents more freedom.

---

## 8. Coordination Should Be Native

Support **multi-agent coordination** with shared context, locking, and signaling.

```typescript
// POST /context/{entityId}/claim
interface ClaimRequest {
  agentId: string;
  action: string; // what the agent is doing
  duration: string; // lock duration (e.g., "5m")
  priority: "low" | "medium" | "high" | "urgent";
}

interface ClaimResponse {
  locked: boolean;
  lockedBy?: string; // another agent's ID
  lockedUntil?: string;
  reason?: string; // what the other agent is doing
  waitEstimate?: string;
}
```

**Why**: No race conditions (Agent A doesn't activate while Agent B is editing). Transparency (all agents know who's doing what). Prioritization (urgent actions can override low-priority locks).

---

## 9. Handoff Patterns Should Be Explicit

Define clear **agent-to-human** and **human-to-agent** handoff triggers.

```
Agent-to-Human Handoff triggers:
- Agent encounters ambiguity
- Agent hits permission boundary
- Agent confidence below threshold
- Human-requested checkpoints

Human-to-Agent Handoff triggers:
- Human approves agent suggestion
- Human delegates routine task
- Human sets-and-forgets with guardrails
```

Build an **approval queue** in the backend from Phase 1 — even if everything is auto-approved initially. The queue becomes the primary human-agent interaction surface in later phases.

---

## 10. Economic Model Should Reward Efficiency

Design your platform's pricing and usage model to scale with automation:

- **Manual tier** — users operate via UI, API available for reporting only
- **Agent-assisted tier** — agents suggest actions, limited API calls, webhook support
- **Agent-autonomous tier** — agents execute within guardrails, higher API limits, performance-based fees
- **Multi-agent tier** — multiple agents coordinating, dedicated event streams, custom pricing

**Why**: The platform earns more when agents deliver value. Heavy API usage is covered by higher tiers. Agents are rewarded for efficiency. Design every feature so that increased automation translates to increased value for both the platform and the user.
