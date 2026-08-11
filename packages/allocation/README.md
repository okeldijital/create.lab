# @creative-lab/allocation

> Resource Allocation bounded context — **EPIC-208**.

Manages **commitments** between resources and work.

Answers: **Who is committed to what?**

Does **not** answer:

- Can they do it? → Capacity
- When do they do it? → Scheduling
- What work exists? → Operations
- What project owns it? → Projects

## Responsibility

- Create and lifecycle-manage allocations
- Group related allocations
- Hold future intent via reservations
- Detect commitment conflicts (duplicates / date overlap)

## Owns

| Aggregate          | Role                                              |
| ------------------ | ------------------------------------------------- |
| `Allocation`       | Resource ↔ work commitment                        |
| `AllocationGroup`  | Named set of allocation IDs                       |
| `Reservation`      | Future hold that converts into an Allocation      |

## Consumes (references only)

- `ProjectId` (Projects)
- `WorkOrderId` (Operations)
- `ResourceId` (Capacity — opaque)
- Organization tenancy

Never mutates upstream aggregates. No capacity formulas. No scheduling.

## Forbidden

- Capacity / availability calculations
- Scheduling logic
- Executing work
- Owning projects, work orders, workers, studios
- Persistence, UI, API, Payload CMS

## Lifecycle

### Allocation

```
PLANNED → ACTIVE ↔ ON_HOLD → COMPLETED | CANCELLED → ARCHIVED
```

Archived allocations are immutable.

### Reservation

```
REQUESTED → APPROVED → CONVERTED
         ↘ CANCELLED
```

Conversion publishes **both** `ReservationConverted` and `AllocationCreated`.

## Domain events

`AllocationCreated`, `AllocationUpdated`, `AllocationActivated`, `AllocationCompleted`,
`AllocationCancelled`, `AllocationArchived`, `AllocationGroupCreated`,
`AllocationGroupArchived`, `ReservationRequested`, `ReservationApproved`,
`ReservationCancelled`, `ReservationConverted`.

## Repository ports

`AllocationRepository`, `AllocationGroupRepository`, `ReservationRepository` — interfaces only.

## Example

```ts
const allocation = await allocationService.create({
  organizationId,
  projectId,
  workOrderId,
  resourceId: "worker-1",
  resourceType: ResourceType.WORKER,
  allocationPercentage: 50,
  startDate,
  endDate,
});

const { allocation: fromReservation } = await reservationService.convert(
  reservationId,
  { workOrderId, resourceType: ResourceType.WORKER, allocationPercentage: 100 },
);
```

## Development

```bash
pnpm --filter @creative-lab/allocation test
pnpm --filter @creative-lab/allocation typecheck
pnpm --filter @creative-lab/allocation build
```
