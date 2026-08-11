# EPIC-201 — Organization Management

| Field               | Value                            |
| ------------------- | -------------------------------- |
| Document Title      | EPIC-201 Organization Management |
| Document Identifier | EPIC-201                         |
| Version             | 1.0.0                            |
| Status              | Implemented (domain model)       |
| Last Updated        | 2026-08-06                       |
| Supersedes          | BUILD-000 placeholder            |
| Owner               | Product & Platform Engineering   |
| Approved By         | EPIC-201                         |
| Effective Date      | 2026-08-06                       |

---

## Status

**Domain model implemented** in `@creative-lab/organization`.

Out of scope for this epic (and not implemented): Payload collections, API
routes, UI, authentication/authorization, infrastructure adapters.

## Objective

Implement the Organization bounded context as the root aggregate for all future
domains. Downstream contexts operate only within an organization.

## Scope

### In scope

- Aggregates: Organization, Department, Team, Studio, OrganizationSettings
- Value objects, enums, domain events, repository ports, domain services,
  policies, domain errors
- Unit tests for invariants, policies, services, events
- Documentation updates (domain map, package README, architecture index, manifest)

### Out of scope

- Users, employees, contractors, roles, permissions, authentication
- Capacity, scheduling, assets, billing, projects
- Payload collections, database schema, API routes, React UI
- Infrastructure adapter implementations

## Architecture

- Package: `packages/organization`
- Style: DDD, clean architecture, dependency inversion
- Persistence: repository **interfaces only**
- Events: immutable, versioned domain events; publish via `DomainEventPublisher` port
- Dependencies: `@creative-lab/core` only (allowed: core, infrastructure, config)

Authority:

- Platform Constitution (Organization first)
- ADR-001, ADR-003, ADR-004, ADR-008, ADR-009

## Domain Model

### Aggregates

| Aggregate            | Notes                                              |
| -------------------- | -------------------------------------------------- |
| Organization         | Root; status lifecycle; branding                   |
| Department           | Hierarchy within org; unique names per org         |
| Team                 | Belongs to department; unique names per department |
| Studio               | PHYSICAL / VIRTUAL / HYBRID; capacity ≥ 0          |
| OrganizationSettings | 1:1 with organization; working week/hours          |

### Value objects

`OrganizationName`, `OrganizationSlug`, `DepartmentName`, `TeamName`,
`StudioName`, `Timezone`, `Locale`, `Currency`, `WorkingWeek`, `WorkingHours`

### Enums

`OrganizationStatus`, `DepartmentStatus`, `TeamStatus`, `StudioStatus`,
`StudioType`

## Repositories

Ports only: `OrganizationRepository`, `DepartmentRepository`, `TeamRepository`,
`StudioRepository`, `OrganizationSettingsRepository`.

## Services

`OrganizationService`, `DepartmentService`, `TeamService`, `StudioService`,
`OrganizationSettingsService` — orchestrate aggregates, uniqueness, policies,
and event publishing.

## Events

`OrganizationCreated/Updated/Archived`, `DepartmentCreated/Updated/Archived`,
`TeamCreated/Updated/Archived`, `StudioCreated/Updated/Archived`,
`OrganizationSettingsUpdated`.

## Activity / RBAC / UI

Not in EPIC-201. Deferred to later epics.

## Testing

Unit tests (Vitest) cover aggregates, value objects, policies, services,
events, errors, and repository interface compliance via in-memory fakes.

## Acceptance Criteria

- [x] Five aggregates implemented
- [x] Value objects validate and are immutable
- [x] Domain events immutable and versioned
- [x] Repository interfaces without persistence implementations
- [x] Domain services encapsulate business logic
- [x] Cross-aggregate policies implemented
- [x] Domain-specific errors defined
- [x] Unit tests cover core rules
- [x] Documentation updated
- [x] No framework/infrastructure leakage in package
- [x] Package builds and respects dependency matrix
