# BUILD-012 Validation Report

## Status

**VALIDATED** (unit/static gates). PostgreSQL live integration unavailable in this environment.

## Metadata

| Field | Value |
| ----- | ----- |
| Branch | `build/012-capacity-persistence` |
| Base | `origin/build/011-knowledge-persistence` (`a6cce69`) |
| HEAD (pre-finalize) | `b4c1b39` |
| Validation date | 2026-08-12 |
| Scope | EPIC-203 Capacity PostgreSQL + Drizzle persistence |

## Implementation summary

| Item | Detail |
| ---- | ------ |
| EPIC | EPIC-203 — Capacity Management |
| Aggregates | CapacityProfile, Capability, AvailabilityProfile, WorkingPattern, ResourceCapacity |
| Tables | `capacity_profiles`, `capabilities`, `availability_profiles`, `working_patterns`, `resource_capacities` |
| Repository adapters | Five Postgres adapters receiving injected `DrizzleDatabase` |
| Migration | `packages/infrastructure/migrations/0008_capacity_persistence.sql` |
| Composition | `registerPostgresCapacityRepositories()` / `CAPACITY_REPOSITORY_KEYS` |
| Schema / mappers | `packages/infrastructure/src/persistence/capacity/` |
| Dependency | `@creative-lab/infrastructure` → `@creative-lab/capacity` |

### Mapping notes

- Branded IDs: CapacityProfileId, CapabilityId, AvailabilityProfileId, WorkingPatternId, ResourceCapacityId, ResourceId
- Numeric/decimal: hours and quantities stored as NUMERIC strings, reconstituted with `Number(...)`
- JSONB: `working_days`, `exceptions` on availability profiles
- Dates: DATE columns mapped via ISO date slice / `new Date(...)`
- Enums/status: resource type, proficiency, capacity unit, profile status as text with SQL CHECK where defined

### `archive()` semantics

| Aggregate | Domain archive state | Adapter `archive()` behavior |
| --------- | -------------------- | ---------------------------- |
| CapacityProfile | Yes (`ARCHIVED` status) | Soft update: `status = 'ARCHIVED'` |
| Capability | Active flag | Soft update: `active = false`, set `effectiveTo` |
| ResourceCapacity | Effective window | Soft update: set `effectiveTo` |
| AvailabilityProfile | **None** | Hard `DELETE` (no domain lifecycle invented) |
| WorkingPattern | **None** | Hard `DELETE` (no domain lifecycle invented) |

Repository ports require `archive(id)` for all five. In-memory domain test doubles are no-ops. AvailabilityProfile and WorkingPattern have no archived/status fields in the domain or schema; implementing `archive` as row deletion is the persistence-level interpretation that does not invent domain lifecycle. Domain model was not changed.

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
| Total | 1275 |
| Passed | 1275 |
| Failed | 0 |
| Skipped | 0 |
| Capacity persistence mapper tests | 5 (`capacity-persistence.test.ts`) |
| Infrastructure package tests | 73 |
| Capacity domain package tests | 24 |

## PostgreSQL integration

**UNAVAILABLE — local PostgreSQL service not provided**

Mapper/schema/unit tests passing does not constitute live PostgreSQL integration.

## Local fixes applied during validation

1. Synchronized `pnpm-lock.yaml` for `@creative-lab/capacity` under infrastructure.
2. Allowed `infrastructure → capacity` in `scripts/check-deps.mjs` and package-dependencies addendum.
3. Updated `platform.manifest.json` (`architectureVersion` → BUILD-012; BUILD-001–012 history; EPIC-203 notes).
4. Minimal architecture documentation updates for EPIC-203 / BUILD-012.
5. Removed unused `and` import in `ResourceCapacityRepositoryAdapter.ts` (lint defect).
6. BUILD-012 status and this validation report.

No domain redesign. No BUILD-004–BUILD-011 architecture changes beyond dependency matrix allowance for capacity.

## Deviations

- Live PostgreSQL integration was not executed.
- Drizzle schema does not restate every SQL CHECK / partial unique index present in migration SQL.
- `capacity_profiles.availability_profile_id` / `working_pattern_id` are nullable UUID columns without deferred SQL FKs in the migration (opaque references in schema; domain links via branded IDs).
- `archive()` for AvailabilityProfile/WorkingPattern is hard delete because the domain has no archive state.

## Remaining concerns

- Apply migrations 0001–0008 and exercise Capacity CRUD/transactions through `PostgresUnitOfWork` against real PostgreSQL before production use.
- Adapter SQL paths are unit-mapper covered only.
- Soft-delete vs hard-delete semantics for AvailabilityProfile/WorkingPattern may warrant a future explicit domain decision if soft archive is required.

## Working-tree status

Clean after finalization commit and push to `origin/build/012-capacity-persistence`.
