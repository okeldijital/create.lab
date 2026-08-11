# EPIC-206 — Operations (Work Execution)

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | EPIC-206 Operations            |
| Document Identifier | EPIC-206                       |
| Version             | 1.0.0                          |
| Status              | Implemented (domain model)     |
| Last Updated        | 2026-08-06                     |
| Supersedes          | BUILD-000 placeholder          |
| Owner               | Product & Platform Engineering |
| Approved By         | EPIC-206                       |
| Effective Date      | 2026-08-06                     |

---

## Status

**Domain model implemented** in `@creative-lab/operations`.

Out of scope: file storage, asset management, projects, tasks, billing, CRM,
notifications, analytics, infrastructure, database, API, Payload CMS, UI.

## Objective

Model the **execution** of work after planning ends. Operations answers what is
running, its operational state, milestones, outputs (metadata), incidents, and
execution history — without owning Organization, Workforce, Capacity, Scheduling,
or Allocation.

## Scope

### In scope

- Aggregates: `WorkOrder`, `WorkSession`, `WorkMilestone`, `WorkOutput`, `WorkIncident`
- Value objects, enums, domain events, repository ports
- Domain services and policies
- Unit tests (no persistence / integration)
- Documentation and platform registration

### Out of scope

File storage; projects/tasks; planning ownership; infrastructure; API; UI.

## Architecture

- Package: `packages/operations`
- Depends on: core, organization, workforce, capacity, scheduling, allocation
- Separation:
  - Allocation = who/what committed
  - Scheduling = when planned
  - **Operations = what actually executed**

## Domain model

### WorkOrder (aggregate root)

References `allocationId` and `bookingId` without owning them.

Status: `CREATED` → `READY` → `IN_PROGRESS` ↔ `PAUSED` → `COMPLETED` | `CANCELLED` → `CLOSED`.

Rules: requires allocation + booking; cannot complete before start; closed cannot reopen;
`actualEnd > actualStart`.

### WorkSession

Execution session (recording, mix, edit, …). Non-overlapping per work order; positive duration.

### WorkMilestone

Progress markers. Unique name per work order; immutable after completion; history retained.

### WorkOutput

Output **metadata** only (name, type, version, status). Version increments; no files.

### WorkIncident

Operational problems with severity/type; resolve once; full audit trail.

## Repositories

Ports only: `WorkOrderRepository`, `WorkSessionRepository`, `WorkMilestoneRepository`,
`WorkOutputRepository`, `WorkIncidentRepository` — find/save/update/archive/exists;
no persistence implementation in this package.

## Services

`WorkOrderService`, `WorkSessionService`, `MilestoneService`, `OutputService`,
`IncidentService` — lifecycle orchestration and event publication.

## Policies

`WorkLifecyclePolicy`, `SessionPolicy`, `MilestonePolicy`, `OutputPolicy`, `IncidentPolicy`.

## Events

`WorkOrderCreated`, `WorkStarted`, `WorkPaused`, `WorkCompleted`, `WorkClosed`,
`SessionStarted`, `SessionEnded`, `MilestoneCompleted`, `OutputCreated`, `OutputApproved`,
`IncidentReported`, `IncidentResolved`.

## Acceptance criteria

- [x] Five Operations aggregates implemented
- [x] Operations owns execution state exclusively
- [x] WorkOrder references Allocation without owning it
- [x] WorkSession independent of Scheduling time model
- [x] WorkOutput metadata only (no file management)
- [x] WorkIncident operational audit trail
- [x] Immutable self-validating value objects
- [x] Repository interfaces only
- [x] Domain services for orchestration
- [x] Domain policies for invariants
- [x] Domain-specific errors
- [x] Immutable versioned events
- [x] Documentation complete
- [x] Allowed imports only (core + org + workforce + capacity + scheduling + allocation)
- [x] No infrastructure/framework dependencies
- [x] Workspace build and dependency matrix compliance

## Relationship with Allocation

Allocation commits resources to bookings. Operations creates work orders that
**reference** those commitments and record actual execution history. Allocation
data is never mutated by Operations.
