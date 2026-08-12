# BUILD-012 — Capacity Persistence

## Status

**Completed — locally validated**

## Scope

PostgreSQL + Drizzle persistence vertical slice for EPIC-203 Capacity Management.

Aggregates:

- CapacityProfile
- Capability
- AvailabilityProfile
- WorkingPattern
- ResourceCapacity

Infrastructure responsibilities:

- Drizzle schemas
- persistence mappers
- PostgreSQL repository adapters
- composition registration
- migration `0008_capacity_persistence.sql`
- mapper round-trip tests

## Boundary

Dependency direction:

`@creative-lab/infrastructure → @creative-lab/capacity`

The Capacity domain remains independent of PostgreSQL, Drizzle, and infrastructure.

## Non-scope

- Scheduling persistence
- Allocation persistence
- Operations persistence
- application use cases
- presentation/API work
- scheduling or allocation algorithms

## Validation

Local validation gates were executed on `build/012-capacity-persistence`. See `reports/build-012-validation.md` for measured results.
