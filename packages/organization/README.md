# @creative-lab/organization

> Organization bounded context — **EPIC-201**.

Pure domain package: aggregates, value objects, domain events, policies,
services, and repository **ports**. No Payload, database, API routes, or UI.

## Purpose

The Organization context is the **root tenancy aggregate** of Creative Lab.
Every downstream domain (Workforce, Capacity, Scheduling, Allocation, …)
operates within an organization.

## Owned aggregates

| Aggregate              | Role                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `Organization`         | Root aggregate — identity, status, branding, locale defaults |
| `Department`           | Functional units (hierarchy within org)                      |
| `Team`                 | Operational groups under a department                        |
| `Studio`               | Physical / virtual / hybrid production workspaces            |
| `OrganizationSettings` | Org-wide operational defaults (1:1 with Organization)        |

## Aggregate relationships

```
Organization 1──* Department 1──* Team
      │
      ├──1 OrganizationSettings
      └──* Studio
```

## Explicit non-ownership

Users, employees, contractors, roles, permissions, authentication, capacity,
scheduling, assets, billing, and projects belong to **other** bounded contexts.

## Public API

Import from `@creative-lab/organization`:

- Aggregates & factories: `Organization`, `Department`, `Team`, `Studio`,
  `OrganizationSettings`, `*Factory`
- Value objects: `OrganizationName`, `OrganizationSlug`, `DepartmentName`,
  `TeamName`, `StudioName`, `Timezone`, `Locale`, `Currency`, `WorkingWeek`,
  `WorkingHours`
- Enums: `OrganizationStatus`, `DepartmentStatus`, `TeamStatus`, `StudioStatus`,
  `StudioType`
- Events: `OrganizationCreated`, `OrganizationUpdated`, `OrganizationArchived`,
  department/team/studio/settings counterparts
- Repository ports: `OrganizationRepository`, `DepartmentRepository`, …
- Services: `OrganizationService`, `DepartmentService`, `TeamService`,
  `StudioService`, `OrganizationSettingsService`
- Policies: `DepartmentHierarchyPolicy`, `OrganizationActivationPolicy`,
  `StudioAvailabilityPolicy`
- Errors: `OrganizationNotFoundError`, `DuplicateOrganizationSlugError`, …

## Business rules (summary)

- Organization name required; slug unique (service-enforced).
- Archived organizations cannot be modified.
- Status transitions validated (`ACTIVE` / `INACTIVE` / `SUSPENDED` / `ARCHIVED`).
- Department names unique per organization; no circular hierarchy.
- Team names unique per department; team & department share organization.
- Studio names unique per organization; capacity ≥ 0.
- One settings record per organization; lifecycle owned by create-org flow.

## Domain boundaries

| Layer                | Location                                |
| -------------------- | --------------------------------------- |
| Domain model         | this package                            |
| Persistence adapters | `@creative-lab/infrastructure` (future) |
| HTTP / CMS           | `apps/*` (future)                       |
| UI                   | `@creative-lab/ui` (future)             |

## Future extension points

- Dependent-domain delete guard (“cannot delete org if workforce exists”)
- `headId` resolution against Workforce
- Outbox / event bus adapters via `DomainEventPublisher`
- Query ports for read models

## Dependency rules

May import: `@creative-lab/core`, `@creative-lab/infrastructure`,
`@creative-lab/config` (BUILD-000A matrix).

Depends on `@creative-lab/core` for DDD primitives (`AggregateRoot`, `ValueObject`,
`DomainEvent`, `DomainError`, etc. — CORE-001).

Must **not** import: `ui`, downstream domains, apps.

## Development

```bash
pnpm --filter @creative-lab/organization test
pnpm --filter @creative-lab/organization typecheck
pnpm --filter @creative-lab/organization build
pnpm --filter @creative-lab/organization lint
```

## Authority

- Platform Constitution Title II (Organization first)
- ADR-001, ADR-003, ADR-004, ADR-008, ADR-009
- EPIC-201
