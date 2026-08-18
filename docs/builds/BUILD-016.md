# BUILD-016 — Allocation Persistence

## Status

**Completed — locally validated**

## Scope

PostgreSQL + Drizzle persistence vertical slice for EPIC-208 Resource Allocation.

### Aggregates / tables

| Aggregate | Table / structure |
| --------- | ----------------- |
| Allocation | `allocations` |
| AllocationGroup | `allocation_groups` (`allocation_ids` UUID[]) |
| Reservation | `reservations` |

### Infrastructure

- Schema/mappers/adapters under `packages/infrastructure/src/persistence/allocation`
- Composition: `registerPostgresAllocationRepositories`
- Migration: `0012_allocation_persistence.sql`
- Mapper round-trip tests

## Boundary

`@creative-lab/infrastructure → @creative-lab/allocation`

Allocation domain remains free of Drizzle/postgres/infrastructure.

Cross-context refs (project, work order, resource) are opaque IDs without inventing new tables.

## Archive / lifecycle

| Aggregate | Domain state | Adapter |
| --------- | ------------ | ------- |
| Allocation | `ARCHIVED` status | Soft status update |
| AllocationGroup | `archived` boolean | Soft flag update |
| Reservation | cancel / convert | Status update; full snapshot via `update()` |

## Baseline

`build/015-operations-persistence` (`d4f9857`)

## Validation

Local validation gates were executed on `build/016-allocation-persistence`. See `reports/build-016-validation.md` for measured results.
