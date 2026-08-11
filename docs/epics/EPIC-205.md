# EPIC-205 — Resource Allocation

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | EPIC-205 Resource Allocation   |
| Document Identifier | EPIC-205                       |
| Version             | 1.0.0                          |
| Status              | Implemented (domain model)     |
| Last Updated        | 2026-08-06                     |
| Supersedes          | BUILD-000 placeholder          |
| Owner               | Product & Platform Engineering |
| Approved By         | EPIC-205                       |
| Effective Date      | 2026-08-06                     |

---

## Status

**Domain model implemented** in `@creative-lab/allocation`.

Out of scope: scheduling math, capacity formulas, workforce CRUD, Payload, API, UI, infrastructure.

## Objective

Orchestrate assignment of resources to bookings while preserving strict ownership
of Organization, Workforce, Capacity, and Scheduling.

## Scope

### In scope

ResourceAllocation, AllocationCandidate, AllocationRule, AllocationGroup,
AllocationConflict; policies; services; unit tests; documentation.

### Out of scope

Creating time, people, or capabilities; projects; operations execution.

## Architecture

- Package: `packages/allocation`
- Depends on: core, organization, workforce, capacity, scheduling
- Separation: Scheduling = when; Capacity = can/how much; Allocation = who/what committed

## Acceptance criteria

- [x] Five aggregates implemented
- [x] Candidate evaluation separated from commitment
- [x] Explicit conflict model
- [x] Reusable allocation rules
- [x] CORE-001 primitives
- [x] Repository ports only
- [x] Unit tests pass
- [x] Documentation updated
- [x] Dependency compliance
