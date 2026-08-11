# ADR-006: Activity Infrastructure

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | ADR 006 activity infrastructure              |
| Document Identifier | ADR-006                                      |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Architecture                        |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | BUILD-000                                    |

---

## Status

Accepted

## Context

Users and auditors need a durable record of meaningful actions (who did what,
when, in which organization). Activity must not be reinvented per feature.

## Decision

1. The platform shall provide **shared activity infrastructure** for recording
   actor, action, subject, organization, timestamp, and optional metadata.
2. Domain packages emit activity through a **common port** rather than writing
   to ad-hoc log tables with incompatible shapes.
3. Activity records are **append-oriented** and tenant-scoped.
4. Activity is complementary to domain events: events integrate systems;
   activity informs humans and audit trails. An implementation may derive
   activity from events where appropriate.
5. PII and secrets must not be stored in activity metadata without explicit
   standards compliance.

## Consequences

### Positive

- Uniform audit and timeline UX.
- Cross-epic consistency.
- Easier compliance reporting.

### Negative

- Storage growth; retention policies will be required later.
- Requires discipline to instrument meaningful actions only.

## Alternatives Considered

1. **Application logs only** — Rejected: not a product/audit surface.
2. **Per-context proprietary history tables** — Rejected as default: fragments
   UX and reporting.
3. **Full event sourcing as the sole history** — Deferred: heavier than needed
   for BUILD-000 foundation.
