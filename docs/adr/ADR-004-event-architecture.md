# ADR-004: Event Architecture

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | ADR 004 event architecture                   |
| Document Identifier | ADR-004                                      |
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

Bounded contexts must react to changes in other contexts without creating
circular package dependencies or hidden side effects.

## Decision

1. Significant domain state changes publish **domain events** as part of the
   owning context’s public contract.
2. Events are **immutable facts** about something that occurred, named in past
   tense in the ubiquitous language.
3. Cross-context integration prefers events over direct imports of internal
   modules.
4. Delivery is assumed **at-least-once** unless a future ADR strengthens
   guarantees; handlers must be **idempotent**.
5. Event payloads include organization identity for tenant-owned facts.
6. In-process or out-of-process transport is an implementation detail; the
   contract is the event model.
7. Synchronous transactional consistency remains local to a single context’s
   unit of work; events do not replace local transactions.

## Consequences

### Positive

- Decoupled evolution of consumers.
- Auditable integration points.
- Aligns with package dependency graph.

### Negative

- Eventual consistency complexity for users and UI.
- Schema evolution of events requires compatibility discipline.

## Alternatives Considered

1. **Shared database integration** — Rejected: destroys boundaries.
2. **Synchronous RPC between all contexts** — Rejected as default: increases
   coupling and failure domains.
3. **Only UI orchestration without domain events** — Rejected: loses durable
   integration and auditability.
