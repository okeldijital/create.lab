# EPIC-219 — Portfolio Management

| Field               | Value                            |
| ------------------- | -------------------------------- |
| Document Title      | EPIC-219 Portfolio Management    |
| Document Identifier | EPIC-219                         |
| Version             | 1.0.0                            |
| Status              | Implemented (domain model)       |
| Last Updated        | 2026-08-07                       |
| Owner               | Product & Platform Engineering   |
| Approved By         | EPIC-219                         |
| Effective Date      | 2026-08-07                       |

---

## Status

**Domain model implemented** in `@creative-lab/portfolio`.

## Objective

Own portfolios, programs, strategic initiatives, and governance milestones.

## Architecture

```
… → engagement → portfolio
```

Highest-level business planning domain. No upstream package may import Portfolio.

## Owns

Portfolio, Program, Initiative, PortfolioMilestone.

## Out of scope

Project execution, work orders, allocation, scheduling, production, finances,
reporting calculations, documents.

## Acceptance criteria

- [x] Exclusive owner of strategic portfolio governance
- [x] Portfolio numbers unique within organization
- [x] Programs, initiatives, milestones managed exclusively here
- [x] Completed/archived aggregates immutable
- [x] Pure domain; dependency matrix intact
- [x] ≥85 unit tests
- [x] Documentation and manifest updated

## Package

`packages/portfolio` → `@creative-lab/portfolio`
