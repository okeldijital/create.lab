# BUILD-013 — Scheduling Persistence

## Status

**Completed — locally validated**

## Scope

PostgreSQL + Drizzle persistence vertical slice for EPIC-204 Scheduling Management.

Aggregates:

- Calendar
- Schedule
- TimeBlock
- Booking
- Shift

Infrastructure responsibilities:

- Drizzle schemas under `packages/infrastructure/src/persistence/scheduling`
- Domain/persistence mappers
- PostgreSQL repository adapters for every Scheduling repository port
- Composition registration via `registerPostgresSchedulingRepositories`
- Migration `0009_scheduling_persistence.sql`
- Mapper round-trip tests

## Boundary

Dependency direction:

`@creative-lab/infrastructure → @creative-lab/scheduling`

The Scheduling domain remains independent of PostgreSQL, Drizzle, and infrastructure.

## Non-scope

- Allocation persistence
- Operations persistence
- scheduling algorithms
- application use cases
- presentation/API work
- authentication
- live PostgreSQL infrastructure provisioning

## Validation

Local validation gates were executed on `build/013-scheduling-persistence`. See `reports/build-013-validation.md` for measured results.
