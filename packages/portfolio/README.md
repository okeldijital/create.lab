# @creative-lab/portfolio

> Portfolio Management bounded context — **EPIC-219**.

Answers:

- Which engagements belong together?
- Which projects belong to a programme?
- What strategic initiative does work support?
- What portfolio governs this work?
- What are the portfolio milestones and status?

Highest-level **business planning / governance** domain—not operational
execution.

## Owns

| Aggregate            | Role                                        |
| -------------------- | ------------------------------------------- |
| `Portfolio`          | Strategic portfolio lifecycle               |
| `Program`            | Related engagements/projects under portfolio |
| `Initiative`         | Strategic objectives with priority          |
| `PortfolioMilestone` | Governance milestones                       |

## Consumes (opaque IDs)

`EngagementId`, `ProjectId`, `OrganizationId`.

## Lifecycle

```
DRAFT → ACTIVE ⇄ ON_HOLD → COMPLETED | CANCELLED → ARCHIVED
```

## Rules (summary)

- Portfolio number unique per organization
- Unique program sequence within portfolio
- Unique initiative titles within portfolio
- Chronological milestones; one active at a time
- Completed/archived aggregates immutable

## Development

```bash
pnpm --filter @creative-lab/portfolio test
pnpm --filter @creative-lab/portfolio typecheck
pnpm --filter @creative-lab/portfolio build
```
