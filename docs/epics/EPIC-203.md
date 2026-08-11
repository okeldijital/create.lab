# EPIC-203 — Capacity Management

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | EPIC-203 Capacity Management   |
| Document Identifier | EPIC-203                       |
| Version             | 1.0.0                          |
| Status              | Implemented (domain model)     |
| Last Updated        | 2026-08-06                     |
| Supersedes          | BUILD-000 placeholder          |
| Owner               | Product & Platform Engineering |
| Approved By         | EPIC-203                       |
| Effective Date      | 2026-08-06                     |

---

## Status

**Domain model implemented** in `@creative-lab/capacity`.

Out of scope: scheduling, assignment, calendar, Payload, API, UI, infrastructure.

## Objective

Model resource availability, capability, and working capacity as the planning
foundation for Scheduling and Allocation — without deciding schedules or
assignments.

## Scope

### In scope

- Aggregates: CapacityProfile, Capability, AvailabilityProfile, WorkingPattern, ResourceCapacity
- Value objects, enums, events, repository ports, services, policies, errors
- Unit tests; documentation

### Out of scope

- Scheduling, time slots, bookings, projects, payroll, leave, auth, UI, CMS

## Architecture

- Package: `packages/capacity`
- Depends on: `@creative-lab/core`, `@creative-lab/organization`, `@creative-lab/workforce`
- DDD / clean architecture / CORE-001 kernel primitives

## Domain boundaries

Capacity = **what / how much / general availability**.  
Scheduling = **when**.  
Allocation = **who**.

## Acceptance criteria

- [x] Five aggregates implemented
- [x] Value objects immutable via `ValueObject`
- [x] Enums for status, resource type, unit, proficiency
- [x] Immutable versioned domain events
- [x] Repository interfaces only
- [x] Domain services + policies
- [x] Domain errors extend `DomainError`
- [x] Unit tests cover core rules
- [x] Documentation updated
- [x] Dependency compliance
- [x] No infrastructure leakage
