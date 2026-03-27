# Phase 1 Agent-First Checklist

Everything on this list costs little to build now but becomes extremely expensive to add later. Check every item before marking a feature complete.

---

## Architecture Checklist

### Command Layer
- [ ] Every action (UI click or API call) goes through a structured command
- [ ] Commands include actor attribution (`{ type, id, humanPrincipal }`)
- [ ] Same command structure used by both human UI and future agent API
- [ ] Commands are validated with a schema validation library (e.g., Zod, Joi, Yup)

### Event Emission
- [ ] Every state change emits a structured event
- [ ] Events include entity ID, event type, timestamp, and relevant data
- [ ] Events are stored in database (even if no subscribers yet)
- [ ] Event types follow `domain.action` naming: `entity.status_changed`, `resource.generation_complete`

### Canonical State Schemas
- [ ] Every entity has a complete schema
- [ ] Schemas include nullable slots for future agentic data:
  - `tags` (domain-specific tagging in Phase 2)
  - `scores` (predictive performance in Phase 2)
  - `performance` (populated when entity is active)
  - `editHistory` (track all modifications)
  - `constraints` (what actions are allowed)
- [ ] UI renders from the same schema the API returns
- [ ] Schema has `constraints` field showing what can be done
- [ ] Schema has `nextActions` showing suggested next steps

### API-First Architecture
- [ ] Build the API endpoint first, then the UI
- [ ] UI consumes the API (via fetch or equivalent), not direct database calls or server functions
- [ ] API response includes full entity state (not partial)
- [ ] API is the single source of truth for both human and agent

### UI-Route Parity (MANDATORY)
- [ ] Every UI mutation (create, update, delete, toggle) has a corresponding AF API route
- [ ] UI uses API calls for all mutations — no direct DB client calls in client code
- [ ] CRUD parity — if the UI supports create, read, update, and delete, the AF route supports all four
- [ ] No orphan operations — there is no UI action that an agent cannot replicate via the API
- [ ] UI reads `constraints` and `nextActions` from the AF response (or has a plan to use them)
- [ ] Verified by grep: no direct DB mutations in hooks/components for this feature's domain

### Structured Audit Logging
- [ ] Every mutation logs: who (actor), what (action), when (timestamp), why (reason)
- [ ] Actor can be human, agent, or system
- [ ] Log includes prior state and new state
- [ ] Log includes outcome (success/failure with error details)

### Permission Infrastructure
- [ ] Permission check exists on every mutation (even if everyone is admin in Phase 1)
- [ ] Permissions are checked per-action (not per-role)
- [ ] Permission denied returns structured error with remediation
- [ ] Infrastructure supports future per-agent policies

### Approval Queue
- [ ] Backend approval queue table exists
- [ ] All actions can optionally route through the queue
- [ ] In Phase 1: everything is auto-approved (queue is invisible)
- [ ] Queue entries include: proposed action, actor, reason, status

### Structured Error Responses
- [ ] Every error returns `{ code, reason, remediation }`
- [ ] `code` is machine-readable (`PERMISSION_DENIED`, `INVALID_STATE_TRANSITION`)
- [ ] `reason` is human-readable explanation
- [ ] `remediation` tells the caller how to fix it
- [ ] No naked string error messages

### Composable Workflows
- [ ] No hardcoded step sequences (step1 → step2 → step3)
- [ ] Each step is an independent atomic action
- [ ] Steps can be called in any order (with constraint validation)
- [ ] An agent could call step 3 before step 2 if it already has the data

### Behavioral Data Capture
- [ ] User clicks are logged as structured events
- [ ] Decision patterns captured (what did user choose, how long to decide)
- [ ] Edit patterns captured (what changed from generated to final)
- [ ] Rejection patterns captured (which suggestions dismissed)
- [ ] All behavioral data is structured and queryable

### Suggestion UI Pattern
- [ ] Infrastructure exists to show suggestions to users
- [ ] Every suggestion includes a "why" explanation
- [ ] User response to suggestion is captured (accepted/rejected/modified)
- [ ] Suggestions are Phase 1 low-stakes: format hints, concept ideas, timing suggestions

---

## Anti-Pattern Checklist

Reject code that does any of the following:

- [ ] UI calls server functions directly (bypassing API)
- [ ] Error responses are plain strings
- [ ] Workflows are hardcoded sequences
- [ ] Data is stored as unstructured free text
- [ ] Mutations have no actor attribution
- [ ] State changes don't emit events
- [ ] Schemas missing `constraints` or `nextActions`
- [ ] Two separate code paths for "human mode" and "agent mode"
- [ ] UI calls database directly for mutations (bypassing AF routes)
- [ ] UI can perform an action that has no corresponding AF API route (parity gap)
- [ ] User actions logged as strings instead of structured events
- [ ] Suggestions shown without "why" explanations

---

## What NOT to Do (Strategic Pitfalls)

1. **Don't build two separate systems** — One platform, two interfaces (UI and API). Same code path.
2. **Don't wait for Phase 3 to think about permissions** — Build the infra now, even if everyone is admin.
3. **Don't store unstructured data** — Parse inputs into structured fields. Log actions as structured events.
4. **Don't hardcode workflows** — Make steps independent and composable.
5. **Don't ignore error states** — Every error needs code + reason + remediation. Agents can't "look at an error and figure it out."
