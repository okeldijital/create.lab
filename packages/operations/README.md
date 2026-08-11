# @creative-lab/operations

> Operations (Work Execution) bounded context — **EPIC-206**.

Execution domain: **what actually happened** after planning ends.
Consumes Organization, Workforce, Capacity, Scheduling, and Allocation without owning them.

## Purpose

- What work is currently being executed?
- What is its operational state?
- What milestones have been completed?
- What outputs have been produced?
- What incidents occurred?
- What is the execution history?

Does **not** own projects, tasks, bookings, allocations, capacity, workers, or studios.
Does **not** store files — outputs are metadata only.

## Owned aggregates

| Aggregate       | Role                                              |
| --------------- | ------------------------------------------------- |
| `WorkOrder`     | Operational execution of allocated work (root)    |
| `WorkSession`   | Time-bounded execution session on a work order    |
| `WorkMilestone` | Meaningful progress marker (immutable when done)  |
| `WorkOutput`    | Produced output **metadata** (versioned, no files)|
| `WorkIncident`  | Operational problem with resolution audit trail   |

## Lifecycle (WorkOrder)

```
Allocation + Booking (upstream, referenced only)
    │
    └── create ──► WorkOrder (CREATED)
                      ├── READY
                      ├── IN_PROGRESS ──► sessions / milestones / outputs / incidents
                      ├── PAUSED
                      ├── COMPLETED
                      ├── CANCELLED
                      └── CLOSED  (terminal; cannot reopen)
```

## Business rules (summary)

- WorkOrder requires Allocation and Booking references
- Starts in `CREATED`; cannot complete before starting
- Closed work cannot reopen
- `actualEnd` must be after `actualStart`
- Sessions belong to one WorkOrder; sessions may not overlap; duration positive
- Milestone names unique per work order; immutable after completion
- Output versions increment per name; historical outputs retained; no file storage
- Incidents historical; immutable after resolution

## Dependencies

Allowed imports:

- `@creative-lab/core`
- `@creative-lab/organization`
- `@creative-lab/workforce`
- `@creative-lab/capacity`
- `@creative-lab/scheduling`

Work orders reference allocations via an opaque local `AllocationId` brand
(Allocation domain owns the commitment aggregate and sits downstream of Operations).

Forbidden: CRM, Commerce, Billing, Analytics, Notifications, Infrastructure, UI, Payload CMS.

## Public API surface

Aggregates, value objects, enums, domain events, repository **ports**, domain services,
policies, factories, and domain errors — exported from package root `index.ts`.

## Development

```bash
pnpm --filter @creative-lab/operations test
pnpm --filter @creative-lab/operations typecheck
pnpm --filter @creative-lab/operations build
```

## Architecture notes

Operations marks the transition from **planning** to **execution**.

Planning domains (Capacity, Scheduling, Allocation) remain authoritative for their
concerns. Operations consumes public contracts and maintains an independent,
auditable execution history for Reporting, Analytics, Billing, and automation.
