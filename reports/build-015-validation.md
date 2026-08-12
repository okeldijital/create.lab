# BUILD-015 Validation Report

## Status

**VALIDATED** (unit/static gates). PostgreSQL live integration unavailable in this environment.

## Metadata

| Field | Value |
| ----- | ----- |
| Branch | `build/015-operations-persistence` |
| Base | `origin/build/014-projects-persistence` (`1dd0457bc8fd38982220edfc40c2ca46677b431b`) |
| Validation date | 2026-08-12 |
| Scope | EPIC-206 Operations PostgreSQL + Drizzle persistence |

## Implementation summary

| Item | Detail |
| ---- | ------ |
| EPIC | EPIC-206 — Operations (Work Execution) |
| Aggregates | WorkOrder, WorkSession, WorkMilestone, WorkOutput, WorkIncident |
| Tables | `work_orders`, `work_sessions`, `work_milestones`, `work_outputs`, `work_incidents` |
| Repository adapters | PostgresWorkOrderRepository, PostgresWorkSessionRepository, PostgresWorkMilestoneRepository, PostgresWorkOutputRepository, PostgresWorkIncidentRepository |
| Migration | `packages/infrastructure/migrations/0011_operations_persistence.sql` |
| Composition | `registerPostgresOperationsRepositories()` / `OPERATIONS_REPOSITORY_KEYS` |
| Schema / mappers | `packages/infrastructure/src/persistence/operations/` |
| Dependency | `@creative-lab/infrastructure` → `@creative-lab/operations` |

### Cross-context references

- `work_orders.allocation_id` — opaque UUID (Allocation owns the aggregate; no FK)
- `work_orders.booking_id` — opaque UUID (Scheduling owns bookings; no FK)

### Archive semantics

| Aggregate | Domain archive state | Adapter `archive()` |
| --------- | -------------------- | ------------------- |
| WorkOrder | None | Hard DELETE |
| WorkSession | None | Hard DELETE |
| WorkMilestone | None | Hard DELETE |
| WorkOutput | Explicit `ARCHIVED` status | Soft update `status = ARCHIVED` |
| WorkIncident | None | Hard DELETE |

### findActive filters

| Aggregate | Active filter |
| --------- | ------------- |
| WorkOrder | status in CREATED, READY, IN_PROGRESS, PAUSED |
| WorkSession | status in ACTIVE, PAUSED |
| WorkMilestone | completed = false |
| WorkOutput | status ≠ ARCHIVED |
| WorkIncident | resolved = false |

## Gates

| Gate | Result |
| ---- | ------ |
| `pnpm install --frozen-lockfile` | **PASS** |
| `pnpm typecheck` | **PASS** |
| `pnpm lint` | **PASS** |
| `pnpm test` | **PASS** |
| `pnpm build` | **PASS** |
| `pnpm exec node scripts/check-deps.mjs` | **PASS** |
| `pnpm exec node scripts/scaffold-check.mjs` | **PASS** |

## Tests

| Metric | Count |
| ------ | ----- |
| Total | 1290 |
| Passed | 1290 |
| Failed | 0 |
| Skipped | 0 |
| Operations persistence mapper tests | 5 (`operations-persistence.test.ts`) |
| Infrastructure package tests | 88 |
| Operations domain package tests | 39 |

## PostgreSQL integration

**UNAVAILABLE — local PostgreSQL service not provided**

## Deviations

- Live PostgreSQL integration was not executed.
- Drizzle schema does not restate every SQL CHECK present in migration SQL.
- WorkOrder/WorkSession/WorkMilestone/WorkIncident `archive()` are hard deletes (no domain archive status).

## Remaining concerns

- Apply migrations 0001–0011 and exercise Operations CRUD/transactions through `PostgresUnitOfWork` against real PostgreSQL before production use.
- Adapter SQL paths are unit-mapper covered only.

## Working-tree status

Clean after finalization commit and push to `origin/build/015-operations-persistence`.
