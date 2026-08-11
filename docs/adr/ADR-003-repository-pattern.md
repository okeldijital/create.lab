# ADR-003: Repository Pattern

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | ADR 003 repository pattern                   |
| Document Identifier | ADR-003                                      |
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

Domain logic must not be coupled to a specific database client or ORM. The
platform needs a stable persistence boundary for aggregates across contexts.

## Decision

1. Each aggregate root that is persisted is accessed through a **repository
   interface** owned by its bounded context.
2. Application and domain layers depend only on repository abstractions.
3. Concrete repository implementations live at the infrastructure edge of the
   owning package (or app composition root), not in unrelated packages.
4. Repositories expose intent-revealing methods aligned to domain language
   (e.g., find by identity within organization), not generic SQL leakage.
5. Complex read models may use **query ports** distinct from write-side
   repositories, still behind explicit interfaces.

## Consequences

### Positive

- Swappable storage implementations.
- Testability via fakes/in-memory repositories.
- Clear aggregate boundaries.

### Negative

- Additional abstraction layer and mapping code.
- Risk of anemic “generic repository” anti-pattern if methods are not
  domain-aligned.

## Alternatives Considered

1. **Active Record throughout** — Rejected: couples domain to persistence.
2. **CQRS with mandatory separate models everywhere** — Deferred: useful
   selectively; not required for all contexts at foundation stage.
3. **Direct ORM usage in application services** — Rejected: leaks
   infrastructure and harms package boundaries.
