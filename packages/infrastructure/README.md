# @creative-lab/infrastructure

> Platform infrastructure package — concrete adapters for the application layer (BUILD-002 onward).

## Purpose

`infrastructure` owns technical implementations behind application and domain
ports. It keeps business-domain packages framework- and database-agnostic.

## BUILD-004 Persistence Foundation

The persistence boundary is standardized as:

- PostgreSQL — relational database
- Drizzle ORM — schema/query layer
- postgres.js — PostgreSQL driver
- `DATABASE_URL` — connection configuration
- `PostgresUnitOfWork` — infrastructure implementation of the application
  `UnitOfWork` port

BUILD-004 intentionally does **not** introduce a generic persistence table
model or move domain rules into infrastructure. Bounded-context repository
adapters and their schemas are added against the repository ports they own.

## Structure

```
packages/infrastructure/
├── src/
│   ├── persistence/
│   │   ├── PostgresConfiguration.ts
│   │   ├── PostgresDatabase.ts
│   │   ├── PostgresUnitOfWork.ts
│   │   └── index.ts
│   ├── config/
│   ├── logging/
│   ├── storage/
│   ├── email/
│   ├── queue/
│   ├── cache/
│   ├── search/
│   ├── payload/
│   ├── auth/
│   ├── integrations/
│   ├── events/
│   ├── adapters/
│   └── index.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Dependency rules

Infrastructure may depend on application/core/config as prescribed by the
package dependency matrix. Domain and application packages must not import
Drizzle, postgres.js, SQL drivers, or PostgreSQL-specific types.

See [package-dependencies](../../docs/standards/package-dependencies.md) and
[ADR-008](../../docs/adr/ADR-008-postgresql-drizzle-persistence.md).

## Development

```bash
pnpm --filter @creative-lab/infrastructure build
pnpm --filter @creative-lab/infrastructure typecheck
pnpm --filter @creative-lab/infrastructure test
pnpm --filter @creative-lab/infrastructure lint
```
