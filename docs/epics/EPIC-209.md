# EPIC-209 — Production Management

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | EPIC-209 Production Management |
| Document Identifier | EPIC-209                       |
| Version             | 1.0.0                          |
| Status              | Implemented (domain model)     |
| Last Updated        | 2026-08-07                     |
| Supersedes          | None                           |
| Owner               | Product & Platform Engineering |
| Approved By         | EPIC-209                       |
| Effective Date      | 2026-08-07                     |

---

## Status

**Domain model implemented** in `@creative-lab/production`.

## Architecture

```
… → operations → projects → allocation → production
```

Production consumes opaque `ProjectId` and `WorkOrderId` only. Never mutates upstream.

## Aggregates

Production, ProductionSession, ProductionMilestone, Revision.

## Lifecycle

- Production: CREATED → PLANNING → ACTIVE ↔ ON_HOLD → COMPLETED → ARCHIVED
- Session: OPEN → PAUSED → RESUMED → COMPLETED (one open)
- Milestone: PENDING → ACTIVE → COMPLETED (ordered, no gaps)
- Revision: REQUESTED → IN_PROGRESS → COMPLETED → CLOSED (sequential numbers)

## Policies

ProductionLifecyclePolicy, SessionPolicy, MilestonePolicy, RevisionPolicy.

## Services

ProductionService, SessionService, MilestoneService, RevisionService.

## Dependency rationale

Production is the execution layer for creative work after planning (projects),
commitments (allocation), and operational work orders exist. It records how
production actually progressed without owning planning or resource models.

## Acceptance criteria

- [x] Four aggregates implemented
- [x] Lifecycles and immutability rules
- [x] One open session; milestone sequencing; sequential revisions
- [x] VOs immutable; ports only; policies; versioned events
- [x] ≥45 unit tests
- [x] Docs + domain map + platform manifest
- [x] Dependency matrix compliance
