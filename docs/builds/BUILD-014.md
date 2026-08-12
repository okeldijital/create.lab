# BUILD-014 — Projects Persistence

## Status

**Completed — locally validated**

## Scope

PostgreSQL + Drizzle persistence vertical slice for EPIC-207 Project Management.

### Aggregates

- Project
- ProjectPhase
- ProjectObjective
- ProjectDependency
- Deliverable

### Tables

- `projects`
- `project_phases`
- `project_objectives`
- `project_dependencies`
- `deliverables`

### Infrastructure

- Drizzle schemas under `packages/infrastructure/src/persistence/projects`
- Domain/persistence mappers for all five aggregates
- PostgreSQL repository adapters implementing every Projects repository port
- Composition registration via `registerPostgresProjectsRepositories`
- Migration `0010_projects_persistence.sql`
- Mapper round-trip tests

## Boundary

Dependency direction:

`@creative-lab/infrastructure → @creative-lab/projects`

The Projects domain remains independent of PostgreSQL, Drizzle, and infrastructure.

## Archive semantics

All five repository ports require `archive(id)`. None of the aggregates expose an `ARCHIVED` domain status (in-memory tests use a side-channel set). Adapters implement archive as hard `DELETE`, consistent with Booking/Shift in BUILD-013, without inventing domain lifecycle fields.

## Non-scope

- Allocation persistence
- Operations persistence
- application use cases
- presentation/API work
- authentication
- live PostgreSQL infrastructure provisioning

## Validation

Local validation gates were executed on `build/014-projects-persistence`. See `reports/build-014-validation.md` for measured results.
