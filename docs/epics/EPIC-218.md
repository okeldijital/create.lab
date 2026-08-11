# EPIC-218 — Engagement Management

| Field               | Value                              |
| ------------------- | ---------------------------------- |
| Document Title      | EPIC-218 Engagement Management     |
| Document Identifier | EPIC-218                           |
| Version             | 1.0.0                              |
| Status              | Implemented (domain model)         |
| Last Updated        | 2026-08-07                         |
| Owner               | Product & Platform Engineering     |
| Approved By         | EPIC-218                           |
| Effective Date      | 2026-08-07                         |

---

## Status

**Domain model implemented** in `@creative-lab/engagement`.

## Objective

Transform an active contract into an executable engagement—the contractual
execution layer (not operational work orders).

## Architecture

```
… → contracts → engagement
```

No upstream package may import Engagement.

## Owns

Engagement, Deliverable, Milestone, Obligation.

## Out of scope

Work orders, scheduling, allocation, production, review, delivery, invoicing,
file storage, external communication.

## Acceptance criteria

- [x] Exclusive owner of contractual execution lifecycle
- [x] Engagement numbers unique within organization
- [x] Deliverables, milestones, obligations managed exclusively here
- [x] Accepted deliverables, fulfilled obligations, completed engagements immutable
- [x] Pure domain; dependency matrix intact
- [x] ≥80 unit tests
- [x] Documentation and manifest updated

## Package

`packages/engagement` → `@creative-lab/engagement`
