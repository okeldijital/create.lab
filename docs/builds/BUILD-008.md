# BUILD-008 — Capacity Persistence

## Status

Implemented on `build/008-capacity-persistence`; local validation is delegated to the implementation Agent.

## Scope

EPIC-203 Capacity PostgreSQL + Drizzle persistence vertical slice.

## Implementation

- PostgreSQL migration `0004_capacity_persistence.sql`
- Drizzle schema for CapacityProfile, Capability, AvailabilityProfile, WorkingPattern and ResourceCapacity
- Domain-to-row and row-to-domain mappers for all five aggregates
- Concrete repository adapters for all five Capacity repository ports
- Composition registration via `registerPostgresCapacityRepositories`
- Infrastructure dependency on `@creative-lab/capacity`

## Architecture

Capacity remains a pure domain package. PostgreSQL, Drizzle ORM and repository implementations live exclusively in infrastructure. Resource identities remain opaque; Capacity does not own Worker or Studio persistence.

## Database constraints

The migration enforces organization tenancy, profile/resource relationships, valid enum domains, positive capacity quantities, effective-date ordering, active capability-name uniqueness and one active capacity profile per resource. Cross-date overlap policies remain domain-owned.

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

Live PostgreSQL integration must be reported separately from mapper/unit validation.

## Non-scope

Scheduling, allocation, operations, presentation, authentication, and live capacity calculation engines are excluded.
