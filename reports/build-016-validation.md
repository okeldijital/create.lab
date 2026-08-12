# BUILD-016 Validation Report

## Status

**VALIDATED** (unit/static gates). PostgreSQL live integration unavailable in this environment.

## Metadata

| Field | Value |
| ----- | ----- |
| Branch | `build/016-allocation-persistence` |
| Base | `origin/build/015-operations-persistence` (`d4f98573914320f0662d314f9b8dea8758055783`) |
| Validation date | 2026-08-12 |
| Scope | EPIC-208 Resource Allocation PostgreSQL + Drizzle persistence |

## Implementation summary

| Item | Detail |
| ---- | ------ |
| EPIC | EPIC-208 — Resource Allocation |
| Aggregates | Allocation, AllocationGroup, Reservation |
| Tables | `allocations`, `allocation_groups`, `reservations` |
| Repository adapters | PostgresAllocationRepository, PostgresAllocationGroupRepository, PostgresReservationRepository |
| Migration | `packages/infrastructure/migrations/0012_allocation_persistence.sql` |
| Composition | `registerPostgresAllocationRepositories()` / `ALLOCATION_REPOSITORY_KEYS` |
| Schema / mappers | `packages/infrastructure/src/persistence/allocation/` |
| Dependency | `@creative-lab/infrastructure` → `@creative-lab/allocation` |

### Design notes

- AllocationGroup membership stored as `allocation_ids UUID[]` (same pattern as knowledge/contracts ID arrays).
- Project, work-order, and resource identities are opaque (no Resource table; no inventing domain aggregates for FKs).
- `reservations.converted_allocation_id` nullable FK to `allocations` within the same slice.
- Reservation `cancel`/`convert` set status only; service also calls `update(entity)` for full snapshot including `convertedAllocationId`.

### Archive / lifecycle

| Aggregate | Domain state | Adapter |
| --------- | ------------ | ------- |
| Allocation | `ARCHIVED` status | Soft status update |
| AllocationGroup | `archived = true` | Soft flag update |
| Reservation cancel | `CANCELLED` | Soft status update |
| Reservation convert | `CONVERTED` | Soft status update (+ entity update for allocation link) |

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
| Total | 1295 |
| Passed | 1295 |
| Failed | 0 |
| Skipped | 0 |
| Allocation persistence mapper tests | 5 (`allocation-persistence.test.ts`) |
| Infrastructure package tests | 93 |
| Allocation domain package tests | 40 |

## PostgreSQL integration

**UNAVAILABLE — local PostgreSQL service not provided**

## Deviations

- Live PostgreSQL integration was not executed.
- Drizzle schema does not restate every SQL CHECK present in migration SQL.
- AllocationGroup membership uses UUID array rather than a separate join table (consistent with established ID-array persistence patterns).

## Remaining concerns

- Apply migrations 0001–0012 and exercise Allocation CRUD/transactions through `PostgresUnitOfWork` against real PostgreSQL before production use.
- Adapter SQL paths are unit-mapper covered only.

## Working-tree status

Clean after finalization commit and push to `origin/build/016-allocation-persistence`.
