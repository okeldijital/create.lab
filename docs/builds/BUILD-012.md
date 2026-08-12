# BUILD-012 — Capacity Persistence

## Status

Implementation complete / validation pending

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

## Non-scope

- Scheduling persistence
- Allocation persistence
- Operations persistence
- application use cases
- presentation/API work
- scheduling or allocation algorithms

## Validation

Validation is pending local execution of the full monorepo gates.
