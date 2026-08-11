# EPIC-208 — Resource Allocation

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | EPIC-208 Resource Allocation   |
| Document Identifier | EPIC-208                       |
| Version             | 1.0.0                          |
| Status              | Implemented (domain model)     |
| Last Updated        | 2026-08-07                     |
| Supersedes          | EPIC-205 domain model shape    |
| Owner               | Product & Platform Engineering |
| Approved By         | EPIC-208                       |
| Effective Date      | 2026-08-07                     |

---

## Status

**Domain model implemented** in `@creative-lab/allocation` per EPIC-208.

Architectural position (dependency chain):

```
core → … → scheduling → operations → projects → allocation
```

Allocation sits **after** Projects and Operations so it may reference work and
initiatives without reverse coupling.

## Objectives

- Model resource–work **commitments** only
- Support grouping and pre-allocation **reservations**
- Detect commitment conflicts without capacity math

## Architecture

- Package: `packages/allocation`
- Depends on: projects, operations, scheduling, capacity, workforce, organization, core
- Upstream packages do **not** import allocation (opaque `AllocationId` brands where needed)

## Aggregates

1. **Allocation** — commitment (project + work order + resource + % + dates)
2. **AllocationGroup** — named collection of allocation IDs
3. **Reservation** — REQUESTED → APPROVED → CONVERTED | CANCELLED

## Policies

- `AllocationPolicy` — percentage, dates, archive immutability
- `AllocationConflictPolicy` — duplicate active + date overlap (no capacity)
- `ReservationPolicy` — lifecycle transitions
- `AllocationGroupPolicy` — unique names; archived immutable

## Services

- `AllocationService` — create/update/activate/complete/cancel/archive
- `AllocationGroupService` — create/rename/add/remove/archive
- `ReservationService` — request/approve/cancel/convert (dual events)

## Events

See package README. All immutable and versioned via Core `DomainEvent`.

## Dependency rationale

Placing Allocation after Operations and Projects keeps commitment language downstream
of “what work exists” and “which initiative owns it,” while Capacity remains the
authority for “can they,” and Scheduling for “when.”

## Acceptance criteria

- [x] Three aggregates: Allocation, AllocationGroup, Reservation
- [x] Percentage 1–100; end > start; archived immutable
- [x] Conflict detection without capacity calculation
- [x] Reservation conversion publishes ReservationConverted + AllocationCreated
- [x] Repository ports only
- [x] ≥36 unit tests
- [x] Docs + domain map + platform manifest
- [x] Dependency matrix: allocation after projects/operations
