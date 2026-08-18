# ADR-008: PostgreSQL + Drizzle Persistence

| Field | Value |
| --- | --- |
| Document Title | PostgreSQL + Drizzle persistence |
| Document Identifier | ADR-008 |
| Version | BUILD-004 |
| Status | Accepted |
| Owner | Platform Architecture |
| Effective Date | BUILD-004 |
|
## Context

BUILD-004 requires a concrete persistence technology. The repository pattern
(ADR-003) establishes that domain and application layers consume repository
ports while concrete persistence remains at the infrastructure boundary.

The platform requires a relational database with strong transactional
semantics, explicit schema ownership, type-safe queries, and a migration path
that does not introduce persistence concerns into domain packages.

## Decision

1. **PostgreSQL** is the platform's relational persistence technology.
2. **Drizzle ORM** is the platform ORM/query-builder and schema-definition
   technology for PostgreSQL.
3. **postgres.js** is the PostgreSQL driver used by the infrastructure package.
4. PostgreSQL connection management and Drizzle database instances live in
   `@creative-lab/infrastructure`.
5. Application and domain packages must not import Drizzle, postgres.js, SQL
   drivers, or PostgreSQL-specific types.
6. Repository ports remain domain-owned interfaces. Concrete repository
   adapters are infrastructure implementations of those ports.
7. Transaction boundaries are implemented by infrastructure through the
   existing application `UnitOfWork` port.
8. Domain-specific tables and repository mappings are introduced by the
   bounded context that owns the corresponding repository port; BUILD-004
   establishes the persistence mechanism and does not create a generic
   cross-domain table model.
9. Database credentials are supplied through `DATABASE_URL` and related
   environment configuration. Credentials must never be committed.

## Consequences

### Positive

- Strong relational integrity and mature transaction semantics.
- Type-safe SQL and schema definitions through Drizzle.
- Persistence remains replaceable behind repository ports.
- Infrastructure can use real transactions without changing domain rules.

### Negative

- Schema and mapping code must be maintained alongside domain evolution.
- PostgreSQL becomes the default operational dependency for persistence-backed
  environments.
- Migration management becomes an explicit engineering responsibility.

## Alternatives Considered

1. **Prisma** — Rejected for BUILD-004; Drizzle provides the selected
   architecture's lower-level, SQL-oriented repository boundary.
2. **MongoDB/document persistence** — Rejected; the platform's domain model
   and transactional requirements favour relational persistence.
3. **Payload as system-of-record persistence** — Rejected; ADR-007 defines
   Payload as a CMS adapter, not the authoritative domain persistence layer.
