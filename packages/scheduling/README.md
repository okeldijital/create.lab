# @creative-lab/scheduling

> Scheduling bounded context — **EPIC-204**.

Temporal planning domain: **when** time is reserved. Independent of **who**
performs work (Allocation) and **whether** a resource is capable (Capacity).

## Purpose

- When will work happen?
- What time has been reserved?
- Which schedules/time blocks hold bookings?

Does **not** select workers, compute capacity, or manage projects.

## Owned aggregates

| Aggregate   | Role                                                               |
| ----------- | ------------------------------------------------------------------ |
| `Schedule`  | Named collection of planned time (timezone immutable after create) |
| `Calendar`  | Logical calendar (unique name per org)                             |
| `TimeBlock` | Absolute time range on a schedule (no overlaps)                    |
| `Booking`   | Reserved time on a block — not an assignment                       |
| `Shift`     | Operating period template (may be overnight); refs WorkingPattern  |

## Temporal model

```
Organization
  ├──* Calendar
  │      └──* Schedule
  │             ├──* TimeBlock
  │             │      └──* Booking (optional, no assignment)
  └──* Shift ──workingPatternId──► Capacity.WorkingPattern
```

## Business rules (summary)

- Archived schedules reject bookings
- Schedule timezone fixed at creation
- TimeBlock end > start; no overlaps within a schedule
- Completed time blocks immutable
- Booking lifecycle: PLANNED → CONFIRMED/CANCELLED/COMPLETED
- Booking may reference a resource id opaquely — does not assign work
- Shift duration positive; overnight windows supported

## Dependencies

`@creative-lab/core`, `@creative-lab/organization`, `@creative-lab/workforce`,
`@creative-lab/capacity`.

Must not import allocation, infrastructure, ui.

## Development

```bash
pnpm --filter @creative-lab/scheduling test
pnpm --filter @creative-lab/scheduling typecheck
pnpm --filter @creative-lab/scheduling build
```

## Authority

- CORE-001 Domain Kernel
- EPIC-201–203 upstream domains
- EPIC-204 Scheduling
