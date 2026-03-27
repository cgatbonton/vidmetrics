# Industry Benchmarks for Software Development Cost Estimation

## Hourly Rates (US Market, 2025-2026)

| Role | Rate Range | Typical Average |
|------|-----------|-----------------|
| Junior Developer (0-2 yrs) | $50-80/hr | $65/hr |
| Mid-Level Developer (2-5 yrs) | $80-120/hr | $100/hr |
| Senior Developer (5+ yrs) | $100-150/hr | $125/hr |
| Staff/Principal Engineer (8+ yrs) | $140-200/hr | $170/hr |
| Tech Lead / Architect | $150-225/hr | $185/hr |

**Default rate for estimates**: $125/hr (senior full-stack developer, 5+ years experience)

## Company Profiles for Comparison

### Solo Developer
- Team: 1 senior full-stack developer
- Overhead multiplier: 1.0x (no coordination overhead)
- Calendar time: human_hours / 160 (1 person, ~160 productive hrs/month)
- Cost: human_hours * $125/hr

### Lean Startup (Seed Stage)
- Team: 1 senior dev + 1 mid dev + part-time designer
- Overhead multiplier: 1.45x (standups, code review, coordination)
- Calendar time: human_hours * 1.45 / 320 (2 devs, ~160 hrs/month each)
- Cost: (senior_hours * $125) + (mid_hours * $100) + (design_hours * $90)
- Simplified: human_hours * 1.45 * $125/hr * 1.0 (assume senior-equivalent)

### Growth Company (Series A-B)
- Team: 2 seniors + 1 mid + 1 junior + PM + designer + QA
- Overhead multiplier: 2.2x (sprints, planning, reviews, meetings, onboarding)
- Calendar time: human_hours * 2.2 / 640 (4 devs, ~160 hrs/month each)
- Cost: human_hours * 2.2 * $125/hr
- Note: Growth-stage teams spend ~45% of time on process, not coding

### Enterprise (Series C+)
- Team: 3 seniors + 2 mid + 2 junior + PM + TPM + designer + QA + DevOps
- Overhead multiplier: 2.65x (compliance, architecture reviews, change management)
- Calendar time: human_hours * 2.65 / 1120 (7 devs, ~160 hrs/month each)
- Cost: human_hours * 2.65 * $125/hr
- Note: Enterprise teams spend ~60% of time on process

## Hour Estimates by Feature Type

### Frontend Components
| Complexity | Hours | Examples |
|-----------|-------|---------|
| Simple page | 4-8 | Static content, simple list view |
| Form with validation | 8-16 | Contact form, settings page |
| Complex interactive UI | 16-40 | Dashboard with charts, drag-and-drop |
| Multi-step wizard/modal | 24-48 | Campaign creation flow, onboarding |
| Real-time updates | 16-32 | Live metrics, notification feeds |

### Backend / API
| Complexity | Hours | Examples |
|-----------|-------|---------|
| Simple CRUD endpoint | 4-8 | Basic REST resource |
| Endpoint with business logic | 8-16 | Validation, transformations, permissions |
| Third-party API integration | 16-40 | OAuth flow + API wrapper + error handling |
| Complex data pipeline | 24-48 | ETL, aggregation, multi-source joins |
| Background job system | 16-32 | Queue processing, retry logic |

### Database
| Complexity | Hours | Examples |
|-----------|-------|---------|
| Simple schema (5-10 tables) | 8-16 | Basic app data model |
| Medium schema (10-25 tables) | 24-48 | Multi-entity with relations |
| Complex schema (25+ tables) | 48-80 | Multi-tenant with audit trails |
| Migration system setup | 8-16 | ORM config, seed data, environments |

### Infrastructure & DevOps
| Complexity | Hours | Examples |
|-----------|-------|---------|
| Basic deployment setup | 8-16 | Vercel/Netlify config, env vars |
| CI/CD pipeline | 16-24 | Tests, linting, staging, production |
| Multi-environment setup | 16-32 | Dev, staging, production with DB per env |
| Monitoring & logging | 8-16 | Error tracking, performance monitoring |

### Authentication & Authorization
| Complexity | Hours | Examples |
|-----------|-------|---------|
| Basic auth (email/password) | 8-16 | Login, register, password reset |
| OAuth integration (per provider) | 8-16 | Google, GitHub, Meta login |
| Role-based access control | 16-32 | Admin, member, viewer roles |
| Multi-tenant auth | 24-40 | Organization-scoped permissions |

### Per-Line-of-Code Estimates (validation check)
- Average lines written per hour (senior dev): 30-50 lines of production code
- Includes: thinking, research, debugging, testing, code review
- Does NOT include: meetings, planning, documentation

## Claude Cost Estimation

### Pro Subscription
- Monthly cost: ~$200/month (Claude Pro with Max plan)
- Daily prorated: ~$6.67/day
- Hourly prorated (8hr day): ~$0.83/hr

### API Usage (alternative)
- Opus: ~$15/M input tokens, ~$75/M output tokens
- Sonnet: ~$3/M input tokens, ~$15/M output tokens
- Typical session: ~50K input + ~10K output tokens per interaction

### Default Claude Cost Formula
- Pro subscription prorated: $6.67/day * active_days
- Round to nearest dollar for presentation

## Assumptions to State

1. Rates based on US market averages (2025-2026)
2. Senior full-stack developer (5+ years experience) as baseline
3. No test coverage — a production build would add ~15-20% to costs
4. Does not include: marketing, legal, hosting/infrastructure, or ongoing maintenance
5. Domain-specific integrations (federal APIs, financial APIs, healthcare) command premium rates
6. Calendar time assumes standard 40hr work weeks with ~75% productivity
