# BUILD-015 — Operations Persistence

## Status

**Completed — locally validated**

## Scope

PostgreSQL + Drizzle persistence vertical slice for EPIC-206 Operations (Work Execution).

### Aggregates / tables

| Aggregate | Table |
| --------- | ----- |
| WorkOrder | `work_orders` |
| WorkSession | `work_sessions` |
| WorkMilestone | `work_milestones` |
| WorkOutput | `work_outputs` |
| WorkIncident | `work_incidents` |

### Infrastructure

- Drizzle schemas under `packages/infrastructure/src/persistence/operations`
- Domain/persistence mappers
- PostgreSQL repository adapters for every Operations repository port
- Composition: `registerPostgresOperationsRepositories`
- Migration `0011_operations_persistence.sql`
- Mapper round-trip tests

## Boundary

`@creative-lab/infrastructure → @creative-lab/operations`

Operations remains independent of infrastructure, Drizzle, and postgres.js.

`allocation_id` and `booking_id` are opaque UUIDs (no SQL FKs to Allocation/Scheduling tables).

## Archive semantics

| Aggregate | Domain archive state | Adapter `archive()` |
| --------- | -------------------- | ------------------- |
| WorkOrder | None | Hard DELETE |
| WorkSession | None | Hard DELETE |
| WorkMilestone | None | Hard DELETE |
| WorkOutput | Explicit `ARCHIVED` status | Soft update status |
| WorkIncident | None | Hard DELETE |

## Baseline

`build/014-projects-persistence` (`1dd0457`)

## Validation

Local validation gates were executed on `build/015-operations-persistence`. See `reports/build-015-validation.md` for measured results.
