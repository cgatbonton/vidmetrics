---
name: cost-analysis
description: >-
  Calculate the ROI of Claude-built software by scanning the codebase, estimating human-equivalent
  development hours, and generating a cost comparison report across company sizes (Solo, Lean Startup,
  Growth Co, Enterprise). This skill should be used when the user invokes /cost-analysis. Key capabilities
  include codebase complexity scanning, feature inventory, speed multiplier calculation, and formatted
  ROI report generation.
---

# Cost Analysis — Claude vs Human Developer ROI

Generate a comprehensive cost/value analysis comparing what Claude built against what it would cost
a human team to build the same thing. Combines automated codebase scanning with feature-level
estimation to produce an investor-ready ROI report.

## When to Use

- User invokes `/cost-analysis`

## Do NOT Use When

- User is asking about costs unrelated to software development estimation
- User wants general project planning or time estimates for future work
- User is asking about Claude API pricing (point them to Anthropic docs)

## Workflow

### Phase 1: Codebase Scan

Gather quantitative metrics from the project. Run these in parallel where possible:

1. **Count source files and lines of code** — Use Glob and Bash to measure:
   - Total source files (exclude dependency directories, build output, etc.)
   - Total lines of code across those files
   - Breakdown by directory

2. **Count structural elements**:
   - Number of pages/routes
   - Number of API endpoints
   - Number of components
   - Number of custom utilities/helpers
   - Number of database tables/models
   - Number of state management stores

3. **Identify integrations**:
   - Third-party API integrations (list all third-party services, APIs, and external integrations)
   - OAuth flows
   - External service connections

### Phase 2: Feature Inventory

Identify and categorize major features/systems. For each, estimate human hours using the benchmarks in `references/industry-benchmarks.md`.

Group features into categories:

| Category | What to Look For |
|----------|-----------------|
| **Frontend** | Pages, dashboards, modals, wizards, forms, data tables, charts |
| **Backend/API** | API routes, business logic, data transformations, background jobs |
| **Database** | Schema design, migrations, relationships, multi-tenancy |
| **Auth & Permissions** | Login flows, OAuth, RBAC, organization scoping |
| **Integrations** | Each third-party API (count separately — each is 16-40 hours) |
| **Infrastructure** | Deployment, CI/CD, monitoring, multi-environment setup |
| **Creative/Assets** | File upload, storage, image/video processing |

The Feature Inventory table MUST contain **at least 8 distinct line items**. Each integration counts as a separate feature. Each multi-step wizard or complex modal counts separately. Do not collapse multiple features into one row.

For each feature, assign an hour estimate based on complexity:
- **Simple**: 4-8 hours
- **Medium**: 8-24 hours
- **Complex**: 24-48 hours
- **Very Complex**: 48-80+ hours

**While scanning, note project-specific risks and caveats** for the Assumptions section (need at least 3). Look for: API deprecation risk, missing test coverage on critical paths, integration maintenance burden, regulatory/compliance needs, missing mobile app, multi-tenant complexity, data migration not included, OAuth token refresh fragility.

### Phase 3: Calculate Metrics

Load `references/industry-benchmarks.md` for rate tables and company profiles.

#### Core Metrics

1. **Total Human Hours** = Sum of all feature estimates from Phase 2
2. **Claude Active Hours** = Ask the user how many hours Claude actively worked, OR estimate from git history (commits * avg session length)
3. **Speed Multiplier** = Total Human Hours / Claude Active Hours
4. **Human Developer Cost** = Total Human Hours * $125/hr (senior rate)
5. **Claude Cost** = Pro subscription prorated for active days (~$6.67/day * active_days)
6. **Net Savings** = Human Developer Cost - Claude Cost
7. **ROI** = Human Developer Cost / Claude Cost

#### Per-Claude-Hour Value

| Value Basis | Formula |
|-------------|---------|
| Engineering only (avg) | Human Developer Cost / Claude Hours |
| Full team (Growth Co) | (Human Hours * 2.2 * $125) / Claude Hours |

#### Company Comparison Table

For each company profile (Solo, Lean Startup, Growth Co, Enterprise), calculate:
- **Calendar Time** = (Human Hours * overhead_multiplier) / (dev_count * 160 hrs/month)
- **Total Human Hours** = Human Hours * overhead_multiplier
- **Total Cost** = Total Human Hours * $125/hr

Use the overhead multipliers from `references/industry-benchmarks.md`:
- Solo: 1.0x
- Lean Startup: 1.45x
- Growth Co: 2.2x
- Enterprise: 2.65x

#### Cross-Validation (MANDATORY)

**Do NOT skip this step.** Compare the two independent estimates:
1. **LOC-based estimate** = Total lines of code / 40 (avg lines per hour for a senior dev)
2. **Feature-based estimate** = Sum from Phase 2 feature inventory

If they differ by >50%, state which estimate you trust more and why. Use the higher estimate with a caveat in the report. This check catches both under-counting features and inflated hour estimates.

### Phase 4: Generate Report

Produce the report in this exact format:

```markdown
# Claude vs Human Developer — Cost & Value Analysis

**Project**: [Project Name]
**Analysis Date**: [Date]
**Claude Active Hours**: [X] hours across [Y] calendar days

---

## Codebase Overview

| Metric | Count |
|--------|-------|
| Source Files | X |
| Lines of Code | X |
| Pages/Routes | X |
| API Endpoints | X |
| Components | X |
| Custom Hooks | X |
| Database Tables | X |
| Platform Integrations | X |

## Feature Inventory

| Feature | Complexity | Est. Human Hours |
|---------|-----------|-----------------|
| [Feature 1] | Complex | 40 |
| [Feature 2] | Medium | 16 |
| ... | ... | ... |
| **Total** | | **X hours** |

## Value per Claude Hour

| Value Basis | Total Value | Claude Hours | $/Claude Hour |
|-------------|-------------|-------------|---------------|
| Engineering only (avg) | $X | X hrs | **$X/Claude hr** |
| Full team (Growth Co) | $X | X hrs | **$X/Claude hr** |

## Speed vs. Human Developer

- Estimated human hours for same work: **X hours**
- Claude active hours: **X hours**
- Speed multiplier: **Xx** (Claude was Xx faster)

## Estimate Cross-Validation

| Method | Estimated Hours |
|--------|----------------|
| Feature-based (Phase 2) | X hours |
| LOC-based (X lines / 40) | X hours |
| Discrepancy | X% |

*[If >50% discrepancy: explain which estimate is used and why]*

## Cost Comparison

- Human developer cost: $X (at $125/hr avg)
- Estimated Claude cost: ~$X (pro subscription prorated for X days)
- **Net savings: ~$X**
- **ROI: ~X,XXXx** (every $1 spent on Claude produced ~$X of value)

---

## Grand Total Summary

| Metric | Solo | Lean Startup | Growth Co | Enterprise |
|--------|------|-------------|-----------|------------|
| Calendar Time | ~X months | ~X months | ~X months | ~X years |
| Total Human Hours | X | X | X | X |
| Total Cost | $XK | $XK | $XK | $XK |

## The Headline

**MUST contain exactly 4 concrete numbers**: (1) Claude active hours, (2) calendar days, (3) total engineering value in dollars, (4) Growth Co cost and timeline. Single sentence, not a paragraph.

*Claude worked for approximately X hours across Y calendar days and produced the equivalent of $X in professional engineering value — roughly $X per Claude hour. A growth-stage company would spend $XK and X months to build this with a full team.*

---

## Assumptions

### Standard
1. Rates based on US market averages (2025-2026)
2. Senior full-stack developer (5+ years experience)
3. No test coverage currently exists — a production build would add ~15-20% to costs
4. Does not include: marketing, legal, hosting/infrastructure, or ongoing maintenance

### Project-Specific (MUST include at least 3)
5. [Derived from codebase scan — e.g., API deprecation risk, integration maintenance burden]
6. [Derived from codebase scan — e.g., missing mobile app, regulatory requirements]
7. [Derived from codebase scan — e.g., multi-tenant complexity, data migration not included]
```

### Phase 5: Output

1. **Pre-flight check**: Scan the report for any remaining placeholder values (`X `, `[X]`, `$X`). If any remain, go back and fill them with real data. Never output a placeholder.
2. Print the full report to the conversation
3. Save the report to `tasks/cost-analysis.md`
4. Announce the file path so the user can share it

## Asking for Claude Hours

If the Claude active hours are not obvious, ask the user:

> "How many hours did Claude actively work on this project? (Include only active coding time, not idle time between sessions.)"

If the user doesn't know, estimate from git history:
- Count total commits
- Estimate ~15-30 minutes per commit for simple changes, ~45-90 minutes for complex ones
- Sum the estimates

## Error Handling

| Error | Recovery |
|-------|----------|
| Cannot determine Claude hours | Ask the user directly; fall back to git commit estimation |
| Codebase too large to scan fully | Sample representative directories, extrapolate |
| Feature estimate diverges from LOC check | Note the discrepancy, use the higher estimate with a caveat |

## References

- Load `references/industry-benchmarks.md` for hourly rates, company profiles, overhead multipliers, and per-feature hour estimates
