# BUILD-005 — Organization Persistence

## Status

**Completed — locally validated.**

## Objective

Establish the first production-capable PostgreSQL persistence vertical slice for
EPIC-201 Organization Management using the PostgreSQL + Drizzle foundation from
BUILD-004.

## Scope

- PostgreSQL/Drizzle schema for Organization, Department, Team, Studio, and OrganizationSettings.
- Versioned SQL migration for the organization persistence schema.
- Infrastructure repository adapters implementing all five EPIC-201 repository ports.
- Explicit domain-to-persistence and persistence-to-domain mappers.
- Composition-root binding for PostgreSQL organization repositories.
- Mapper/schema tests and repository adapter coverage appropriate to the infrastructure layer.

## Architectural constraints

- `@creative-lab/organization` remains a pure domain package.
- PostgreSQL, postgres.js, Drizzle, and persistence schemas remain infrastructure concerns.
- Repository ports remain owned by the domain and are consumed through application ports.
- Repository adapters must operate on the Drizzle database instance supplied by composition.
- When used with `PostgresUnitOfWork`, repositories must receive the transaction-bound Drizzle instance from `getDatabase()`.
- No API, UI, Payload, authentication, file storage, payments, or other bounded-context persistence is included.

## Persistence model

| Domain aggregate | Persistence table |
|---|---|
| Organization | `organizations` |
| Department | `departments` |
| Team | `teams` |
| Studio | `studios` |
| OrganizationSettings | `organization_settings` |

Organization ownership is represented by foreign keys for all organization-scoped
records. Database uniqueness constraints reinforce the existing domain invariants
without replacing domain validation.

## Repository adapters

- `PostgresOrganizationRepository`
- `PostgresDepartmentRepository`
- `PostgresTeamRepository`
- `PostgresStudioRepository`
- `PostgresOrganizationSettingsRepository`

## Migration

`packages/infrastructure/migrations/0001_organization_persistence.sql`

## Validation gates

The local implementation agent must run:

```text
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec node scripts/check-deps.mjs
pnpm exec node scripts/scaffold-check.mjs
```

A real PostgreSQL integration test is preferred where the local environment
provides PostgreSQL. If no PostgreSQL service is available, the limitation must
be explicitly reported; unit tests must remain deterministic.

## Completion criteria

BUILD-005 is complete only after all gates pass, the lockfile is synchronized,
the working tree is clean, the branch is pushed, and a complete validation report
is recorded in `reports/build-005-validation.md`.
