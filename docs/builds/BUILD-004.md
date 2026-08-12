# BUILD-004 — Persistence Foundation

## Status

Implementation complete; local validation pending.

## Objective

Establish the concrete persistence technology and infrastructure boundary for
Creative Lab without introducing persistence concerns into domain packages.

## Technology decision

- Database: PostgreSQL
- ORM/query/schema layer: Drizzle ORM
- PostgreSQL driver: postgres.js
- Application transaction port: existing `UnitOfWork`
- Infrastructure implementation: `PostgresUnitOfWork`

## Implemented

### Infrastructure

`@creative-lab/infrastructure` now provides:

- PostgreSQL configuration from `DATABASE_URL` and optional connection settings.
- A Drizzle database factory backed by postgres.js.
- PostgreSQL connectivity health check.
- A reserved-connection `PostgresUnitOfWork` implementing the application
  `UnitOfWork` port.
- Public persistence exports under the infrastructure package.

### Boundaries

- Domain packages remain free of PostgreSQL, Drizzle, and driver imports.
- Application continues to consume ports only.
- No generic persistence table model was introduced.
- No domain-specific repository adapter was invented without an owning schema
  specification.
- Domain-specific schemas/repositories remain the responsibility of subsequent
  persistence work for their bounded contexts.

### Documentation

- ADR-008 records PostgreSQL + Drizzle as the platform persistence decision.
- Infrastructure README documents the persistence boundary.

## Tests added

Persistence foundation tests cover:

- required database configuration
- environment configuration mapping
- invalid configuration rejection
- transaction begin/commit lifecycle
- transaction rollback lifecycle
- reserved connection release

## Validation

Local validation is intentionally not claimed by this implementation pass.
The local implementation agent must run the complete monorepo gate before BUILD-004
is considered validated:

```text
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec node scripts/check-deps.mjs
pnpm exec node scripts/scaffold-check.mjs
```

The lockfile must be regenerated with the repository's pinned pnpm version after
adding the PostgreSQL/Drizzle dependencies and committed as part of BUILD-004.
