# EPIC-204 — Scheduling

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | EPIC-204 Scheduling            |
| Document Identifier | EPIC-204                       |
| Version             | 1.0.0                          |
| Status              | Implemented (domain model)     |
| Last Updated        | 2026-08-06                     |
| Supersedes          | BUILD-000 placeholder          |
| Owner               | Product & Platform Engineering |
| Approved By         | EPIC-204                       |
| Effective Date      | 2026-08-06                     |

---

## Status

**Domain model implemented** in `@creative-lab/scheduling`.

Out of scope: assignment, capacity math, projects, Payload, API, UI, infrastructure.

## Objective

Own the platform temporal model — calendars, schedules, time blocks, bookings,
and shifts — without deciding who works or whether they are capable.

## Scope

### In scope

Schedule, Calendar, TimeBlock, Booking, Shift; VOs; enums; events; repository
ports; services; policies; unit tests; documentation.

### Out of scope

Resource selection, capacity calculation, projects, tasks, assignments, payroll.

## Architecture

- Package: `packages/scheduling`
- Depends on: core, organization, workforce, capacity
- Separation: Capacity = capability/how much; Scheduling = when; Allocation = who

## Acceptance criteria

- [x] Five aggregates implemented
- [x] No overlapping TimeBlocks
- [x] Bookings independent of assignment
- [x] Value objects / events / errors via CORE-001
- [x] Repository ports only
- [x] Unit tests pass
- [x] Documentation updated
- [x] Dependency compliance
