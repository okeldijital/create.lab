# EPIC-202 — Workforce Management

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | EPIC-202 Workforce Management  |
| Document Identifier | EPIC-202                       |
| Version             | 1.0.0                          |
| Status              | Implemented (domain model)     |
| Last Updated        | 2026-08-06                     |
| Supersedes          | BUILD-000 placeholder          |
| Owner               | Product & Platform Engineering |
| Approved By         | EPIC-202                       |
| Effective Date      | 2026-08-06                     |

---

## Status

**Domain model implemented** in `@creative-lab/workforce`.

Out of scope: identity/auth, payroll, leave, scheduling, capacity, Payload,
API routes, UI, infrastructure adapters.

## Objective

Implement the Workforce bounded context: people, employment, positions, and
reporting structures scoped to Organization. Depends only on Organization + Core.

## Scope

### In scope

- Aggregates: Worker, Position, Employment, EmploymentContract, ReportingRelationship
- Value objects, enums, domain events, repository ports, services, policies, errors
- Unit tests; documentation

### Out of scope

- Authentication/identity, RBAC, payroll, leave, capacity, scheduling, allocation
- Infrastructure adapters, UI, API

## Architecture

- Package: `packages/workforce`
- DDD / clean architecture / ports for persistence and event publishing
- Consumes: `@creative-lab/core`, `@creative-lab/organization`
- Errors extend shared `DomainError` from core

## Domain model

See package README for relationships and rules.

## Acceptance criteria

- [x] All aggregates implemented
- [x] Immutable self-validating value objects
- [x] Enumerations and status transitions
- [x] Immutable versioned domain events
- [x] Repository interfaces only
- [x] Domain services + policies
- [x] Domain-specific errors
- [x] Unit tests for critical rules
- [x] Documentation updated
- [x] No infrastructure leakage
- [x] Dependency matrix compliance
