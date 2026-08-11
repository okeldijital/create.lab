# @creative-lab/workforce

> Workforce bounded context — **EPIC-202**.

Pure domain package for people within an organization: workers, positions,
employment relationships, contracts (metadata only), and reporting hierarchy.

No authentication, Payload, database, API routes, or UI.

## Purpose

Introduce **organization-scoped people** independent of identity/login accounts
and independent of capacity/scheduling.

Workers are organizational members, not auth users.

## Owned aggregates

| Aggregate               | Role                                                 |
| ----------------------- | ---------------------------------------------------- |
| `Worker`                | Person in an organization (employee/contractor/etc.) |
| `Position`              | Job role title/grade                                 |
| `Employment`            | Employment relationship lifecycle                    |
| `EmploymentContract`    | Contractual metadata (no files)                      |
| `ReportingRelationship` | Manager hierarchy (historical)                       |

## Aggregate relationships

```
Organization (external)
    │
    ├──* Worker ──optional──► Position
    │      │
    │      ├── required departmentId (Organization.Department)
    │      ├── optional teamId (Organization.Team)
    │      ├──* Employment ──* EmploymentContract
    │      └──* ReportingRelationship (manager Worker)
    └──* Position
```

## Explicit non-ownership

Organization/Department/Team structure, scheduling, capacity, allocation,
payroll, leave, authentication, authorization, projects, assets.

## Business rules (summary)

- Worker belongs to exactly one organization; **must** have a department; team optional.
- Email and employee number unique within organization.
- Archived workers cannot be modified.
- Manager must be same organization; no self-report; no reporting cycles.
- One **active** employment per worker; end date ≥ start date.
- One **active** contract per employment; expiry after effective date.
- Position titles unique within organization.

## Public API

Import from `@creative-lab/workforce`:

- Aggregates & factories
- Value objects: `WorkerName`, `EmailAddress`, `PhoneNumber`, `EmployeeNumber`,
  `EmploymentPeriod`, `WorkingHours`, `NoticePeriod`, `ProbationPeriod`,
  `PositionTitle`
- Enums: `WorkerStatus`, `EmploymentType`, `EmploymentStatus`, `ContractStatus`,
  `PositionStatus`, `ContractType`
- Events, repository ports, services, policies, domain errors
- DDD primitives from `@creative-lab/core` (CORE-001): `AggregateRoot`,
  `ValueObject`, `DomainEvent`, `DomainError`, etc.

## Integration boundaries

| May import                   | Must not import                              |
| ---------------------------- | -------------------------------------------- |
| `@creative-lab/core`         | capacity, scheduling, allocation, operations |
| `@creative-lab/organization` | infrastructure, ui, assets, collaboration    |

## Future extension points

- Position archive guard when active worker assignments exist
- Payroll / leave / identity contexts
- Capacity demand signals from workforce headcount

## Development

```bash
pnpm --filter @creative-lab/workforce test
pnpm --filter @creative-lab/workforce typecheck
pnpm --filter @creative-lab/workforce build
pnpm --filter @creative-lab/workforce lint
```

## Authority

- Platform Constitution (Organization first)
- ADR-001, ADR-003, ADR-004, ADR-008, ADR-009
- EPIC-201 (Organization), EPIC-202 (Workforce)
