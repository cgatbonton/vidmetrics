# Trust Ladder — User Autonomy Progression

The framework for how a user progresses from "I do everything manually" to "agents handle my workflows."

---

## Autonomy Levels

```
Level 0: MANUAL
- User does everything
- Platform is just a tool
- "I click every button"

Level 1: INFORMED
- Platform shows insights and suggestions
- User still decides and acts
- "Show me what you think, but I'll decide"

Level 2: ASSISTED
- Platform prepares actions for approval
- User reviews and approves/rejects
- "Draft it for me, I'll review"

Level 3: SUPERVISED
- Platform executes routine actions automatically
- User reviews after the fact
- "Do the routine stuff, I'll check your work"

Level 4: AUTONOMOUS
- Platform handles workflows within guardrails
- User sets strategy and constraints
- "Run it, but stay within these bounds"

Level 5: STRATEGIC
- Platform proposes strategy changes
- User focuses on business goals
- "Tell me what we should be doing differently"
```

---

## Design Rules

1. **Every user starts at Level 0.** Track where each user is and adjust the UI accordingly.

2. **The ladder is per-feature, not global.** A user might be:
   - Level 3 on content generation (auto-generate, review after)
   - Level 1 on budget management (show suggestions only)
   - Level 0 on strategy (fully manual)

3. **UI adapts to level:**
   - Level 0-1: Manual controls prominent, suggestions subtle
   - Level 2-3: Approval queue prominent, manual controls available
   - Level 4-5: Autonomy dashboard prominent, with override controls

4. **Design every feature to support progression** up the ladder without architectural changes.

---

## The Invisible Agent Pattern

A transitional strategy: use agents internally before exposing them to users.

### Phase 1: Invisible Agents
- Agent auto-tags uploaded assets (classification, metadata extraction)
- Agent auto-suggests entity names based on context
- Agent pre-fills configuration based on project + domain signals
- Agent optimizes resource processing for output
- **Users see**: "Smart defaults" and "intelligent features"
- **Users don't see**: An agent made these decisions

### Phase 2: Visible but Contained Agents
- "AI Quality Score" badge on generated outputs
- "AI Suggestion" label on recommended options
- "Powered by AI" tag on performance insights
- **Users see**: AI is helping, clearly labeled
- **Users feel**: "Oh, that's why the suggestions were so good"

### Phase 3: Agent as First-Class Feature
- "Your AI Agent" dashboard
- Autonomy controls
- Agent activity feed
- **Users see**: Full agent capabilities
- **Users feel**: Ready, because they've been using agents (unknowingly) for months

---

## Progressive Disclosure Timeline

```
Month 1-3 (Phase 1):
User sees: Core product UI, manual workflow
Hidden: Command layer, event sourcing, state schemas

Month 4-6 (Phase 1B):
User sees: "Smart Suggestions" toggle in settings
Reveal: "Let the platform suggest actions based on past performance"

Month 7-9 (Phase 2A):
User sees: Quality scores, performance predictions
Reveal: "The platform analyzes your patterns to predict what works"

Month 10-12 (Phase 2B):
User sees: "Auto-generate" button
Reveal: "Generate outputs optimized for your top-performing patterns"

Month 13+ (Phase 3):
User sees: Autonomy settings panel
Reveal: "Set rules for what the platform can do automatically"
```

Each reveal builds on trust established in the previous phase. Users opt in to more automation as they see value.

---

## Data Collection for Trust Building

Capture these signals in Phase 1 (even if not analyzed yet):

### User Behavior Signals
- Time spent on each screen (where do users struggle?)
- Click patterns in selection flows (what do they gravitate toward?)
- Edit patterns (what do they change most often after generation?)
- Rejection patterns (which suggestions do they dismiss?)

### Resource Metadata
- Generation parameters (prompt, configuration, style direction)
- Edit history (what changed from generated to final)
- Export metadata (format, destination, context)

### Decision Patterns
- What did the user choose when given options?
- How long did they deliberate?
- Did they override AI suggestions? How often?

This data becomes training signal for:
- Domain-specific tagging (Phase 2)
- Predictive scoring (Phase 2)
- Agent behavior (Phase 3) — teaching agents to make decisions users would approve of

**Store it structured, make it queryable. Don't analyze it yet — just capture it.**
