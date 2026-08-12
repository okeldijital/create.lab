# BUILD-007 — Workforce Persistence

## Status

Implemented on `build/007-workforce-persistence`; local validation is delegated to the implementation Agent.

## Baseline

BUILD-006 validated baseline:

`74c1e892ddf842d1b41fbba1bde10bc42c1ea078`

## Scope

Implement the PostgreSQL + Drizzle persistence vertical for EPIC-202 Workforce inside `@creative-lab/infrastructure`.

### Persisted aggregates

- Worker
- Position
- Employment
- EmploymentContract
- ReportingRelationship

### Persistence artifacts

- `packages/infrastructure/migrations/0003_workforce_persistence.sql`
- Drizzle schema under `packages/infrastructure/src/persistence/workforce/`
- PostgreSQL repository adapters for all five Workforce repository ports
- Domain ↔ persistence mappers for all five aggregates
- Composition registration through `registerPostgresWorkforceRepositories`
- Mapper tests under `packages/infrastructure/src/__tests__/workforce-persistence.test.ts`

## Architectural constraints

- PostgreSQL, postgres.js and Drizzle remain infrastructure-only.
- Workforce domain remains free of infrastructure dependencies.
- Repository ports remain domain interfaces.
- Adapters receive `DrizzleDatabase`; they do not create database clients.
- No application, API, UI, authentication or presentation implementation is included.
- No other domain persistence vertical is introduced.

## Database constraints

The migration includes organization tenancy, aggregate relationships, employee number/email uniqueness, employment period checks, active employment uniqueness, active contract uniqueness, reporting self-reference prevention, reporting period checks and one active reporting relationship per worker.

## Validation

The local Agent must run:

```text
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec node scripts/check-deps.mjs
pnpm exec node scripts/scaffold-check.mjs
```

Live PostgreSQL integration is reported separately from unit/mapping validation. If PostgreSQL is unavailable, that limitation must be stated explicitly.

## Non-scope

Scheduling, capacity, allocation, application use cases, presentation, authentication, API routes and live production infrastructure remain outside BUILD-007.
