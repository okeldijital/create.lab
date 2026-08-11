# EPIC-211 — Review & Approval Domain

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | EPIC-211 Review & Approval     |
| Document Identifier | EPIC-211                       |
| Version             | 1.0.0                          |
| Status              | Implemented (domain model)     |
| Last Updated        | 2026-08-07                     |
| Owner               | Product & Platform Engineering |
| Approved By         | EPIC-211                       |
| Effective Date      | 2026-08-07                     |

---

## Status

**Domain model implemented** in `@creative-lab/review`.

## Architecture

```
… → assets → review
```

Review consumes Project, Production, and Asset as opaque references only.

## Aggregates

Review, Approval, ReviewSession, ReviewDecision.

## Acceptance criteria

- [x] Four aggregates; immutable decisions
- [x] Approval counting and auto-complete
- [x] Single active session
- [x] Ports only; policies; versioned events
- [x] ≥45 unit tests
- [x] Docs + domain map + platform manifest
- [x] Dependency matrix compliance
