# BUILD-014 Validation Report

## Status

**VALIDATED** (unit/static gates). PostgreSQL live integration unavailable in this environment.

## Metadata

| Field | Value |
| ----- | ----- |
| Branch | `build/014-projects-persistence` |
| Base | `origin/build/013-scheduling-persistence` (`6f5ffc24814d64d5c99436dc3913eb654aaa8801`) |
| Validation date | 2026-08-12 |
| Scope | EPIC-207 Projects PostgreSQL + Drizzle persistence |

## Implementation summary

| Item | Detail |
| ---- | ------ |
| EPIC | EPIC-207 — Project Management |
| Aggregates | Project, ProjectPhase, ProjectObjective, ProjectDependency, Deliverable |
| Tables | `projects`, `project_phases`, `project_objectives`, `project_dependencies`, `deliverables` |
| Repository adapters | PostgresProjectRepository, PostgresProjectPhaseRepository, PostgresProjectObjectiveRepository, PostgresProjectDependencyRepository, PostgresDeliverableRepository |
| Migration | `packages/infrastructure/migrations/0010_projects_persistence.sql` |
| Composition | `registerPostgresProjectsRepositories()` / `PROJECTS_REPOSITORY_KEYS` |
| Schema / mappers | `packages/infrastructure/src/persistence/projects/` |
| Dependency | `@creative-lab/infrastructure` → `@creative-lab/projects` |

### Mapping notes

- Branded IDs: ProjectId, ProjectPhaseId, ProjectObjectiveId, ProjectDependencyId, DeliverableId
- Numeric: objective target/current as NUMERIC strings, reconstituted with `Number(...)`
- UUID arrays: deliverable `work_order_references`
- Timestamps: project dates, phase started/completed, objective/deliverable completion
- Enums: project/phase/objective/dependency/deliverable status and type/priority as text with SQL CHECK
- Uniqueness: org+name (projects), project+sequence (phases), project+name (objectives/deliverables), self-dependency CHECK

### `archive()` semantics

| Aggregate | Domain archive state | Adapter `archive()` |
| --------- | -------------------- | ------------------- |
| Project | None (CLOSED/CANCELLED/COMPLETED are lifecycle, not archive) | Hard DELETE |
| ProjectPhase | None | Hard DELETE |
| ProjectObjective | None | Hard DELETE |
| ProjectDependency | None (CANCELLED/RESOLVED are lifecycle) | Hard DELETE |
| Deliverable | None | Hard DELETE |

In-memory domain test doubles use a side-channel archived set. Hard delete implements repository `archive` without inventing domain fields.

### `findActive()` semantics

| Aggregate | Active filter |
| --------- | ------------- |
| Project | status not in CLOSED, CANCELLED, COMPLETED |
| ProjectPhase | status = ACTIVE |
| ProjectObjective | status not in ACHIEVED, FAILED |
| ProjectDependency | status = ACTIVE |
| Deliverable | status ≠ DELIVERED |

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
| Total | 1285 |
| Passed | 1285 |
| Failed | 0 |
| Skipped | 0 |
| Projects persistence mapper tests | 5 (`projects-persistence.test.ts`) |
| Infrastructure package tests | 83 |
| Projects domain package tests | 32 |

## PostgreSQL integration

**UNAVAILABLE — local PostgreSQL service not provided**

Mapper/schema/unit tests passing does not constitute live PostgreSQL integration.

## Deviations

- Live PostgreSQL integration was not executed.
- Drizzle schema does not restate every SQL CHECK / partial unique index present in migration SQL.
- All five `archive()` methods are hard deletes because the domain has no archive status for these aggregates.

## Remaining concerns

- Apply migrations 0001–0010 and exercise Projects CRUD/transactions through `PostgresUnitOfWork` against real PostgreSQL before production use.
- Adapter SQL paths are unit-mapper covered only.
- Soft-hide archive (as in domain in-memory doubles) may warrant a future explicit domain decision if hard delete is too destructive for production.

## Working-tree status

Clean after finalization commit and push to `origin/build/014-projects-persistence`.
