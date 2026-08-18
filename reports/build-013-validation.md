# BUILD-013 Validation Report

## Status

**VALIDATED** (unit/static gates). PostgreSQL live integration unavailable in this environment.

## Metadata

| Field | Value |
| ----- | ----- |
| Branch | `build/013-scheduling-persistence` |
| Base | `origin/build/012-capacity-persistence` (`c3d9086`) |
| Validation date | 2026-08-12 |
| Scope | EPIC-204 Scheduling PostgreSQL + Drizzle persistence |

## Implementation summary

| Item | Detail |
| ---- | ------ |
| EPIC | EPIC-204 — Scheduling Management |
| Aggregates | Calendar, Schedule, TimeBlock, Booking, Shift |
| Tables | `calendars`, `schedules`, `time_blocks`, `bookings`, `shifts` |
| Repository adapters | PostgresCalendarRepository, PostgresScheduleRepository, PostgresTimeBlockRepository, PostgresBookingRepository, PostgresShiftRepository |
| Migration | `packages/infrastructure/migrations/0009_scheduling_persistence.sql` |
| Composition | `registerPostgresSchedulingRepositories()` / `SCHEDULING_REPOSITORY_KEYS` |
| Schema / mappers | `packages/infrastructure/src/persistence/scheduling/` |
| Dependency | `@creative-lab/infrastructure` → `@creative-lab/scheduling` |

### Mapping notes

- Branded IDs: ScheduleId, CalendarId, TimeBlockId, BookingId, ShiftId; WorkingPatternId (capacity) on Shift
- Timestamps: schedule effective window, time-block range, created/updated
- Enums: schedule/calendar/booking/time-block status and types as text with SQL CHECK
- Nullable: purpose, description, bookingType, resourceReference, notes, effectiveTo

### `archive()` semantics

| Aggregate | Domain state | Adapter `archive()` |
| --------- | ------------ | ------------------- |
| Calendar | ARCHIVED status | Soft update status |
| Schedule | ARCHIVED status | Soft update status |
| TimeBlock | REMOVED status | Soft update status to REMOVED |
| Booking | No archive status | Hard DELETE |
| Shift | No archive/status field | Hard DELETE |

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
| Total | 1280 |
| Passed | 1280 |
| Failed | 0 |
| Skipped | 0 |
| Scheduling persistence mapper tests | 5 (`scheduling-persistence.test.ts`) |
| Infrastructure package tests | 78 |
| Scheduling domain package tests | 24 |

## PostgreSQL integration

**UNAVAILABLE — local PostgreSQL service not provided**

Mapper/schema/unit tests passing does not constitute live PostgreSQL integration.

## Deviations

- Live PostgreSQL integration was not executed.
- Drizzle schema does not restate every SQL CHECK present in migration SQL.
- Booking and Shift repository `archive()` are hard deletes because the domain has no archive status for those aggregates.

## Remaining concerns

- Apply migrations 0001–0009 and exercise Scheduling CRUD/transactions through `PostgresUnitOfWork` against real PostgreSQL before production use.
- Adapter SQL paths are unit-mapper covered only.

## Working-tree status

Clean after finalization commit and push to `origin/build/013-scheduling-persistence`.
