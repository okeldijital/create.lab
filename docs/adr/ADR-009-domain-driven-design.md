# ADR-009: Domain Driven Design

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | ADR 009 domain driven design                 |
| Document Identifier | ADR-009                                      |
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

Creative Lab’s problem space (organization, workforce, capacity, scheduling,
allocation) is domain-rich. Without DDD discipline, the codebase becomes a
transport shell around a database.

## Decision

1. Apply **Domain-Driven Design** as the modeling approach for domain packages.
2. Each package owns a **ubiquitous language** documented in its epic and
   README as the context matures.
3. Prefer **aggregates, entities, value objects, domain services, and domain
   events** where they clarify invariants.
4. Keep **application services** as orchestration for use-cases; keep domain
   rules out of UI and CMS adapters.
5. Use **anti-corruption layers** when integrating external models (including
   CMS documents).
6. Strategic design: bounded contexts align to packages (ADR-008).
7. Tactical patterns are mandatory only where they reduce complexity; do not
   force ceremony for trivial CRUD configuration unless invariants demand it.

## Consequences

### Positive

- Shared language with product stakeholders.
- Invariants protected near the model.
- Natural fit with repositories and events.

### Negative

- Learning curve for contributors new to DDD.
- Risk of over-modeling simple cases if teams ignore the “trivial CRUD”
  clause.

## Alternatives Considered

1. **Transaction script only** — Rejected as sole approach: weak invariant
   protection for scheduling/allocation complexity.
2. **Strict hexagonal purity everywhere on day one** — Softened: ports and
   adapters are required at persistence and integration edges; full ceremony
   is proportional to complexity.
3. **Anemic models + services everywhere** — Rejected as default for core
   domains with non-trivial rules.
