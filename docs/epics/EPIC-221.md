# EPIC-221 — Application Runtime & Tenant Context Integration

| Field | Value |
| --- | --- |
| Document Identifier | EPIC-221 |
| Version | 1.0.0 |
| Status | Implemented — runtime boundary foundation |
| Effective Date | 2026-08-18 |

## Objective
Establish the governed web-to-application runtime boundary for tenant-scoped product surfaces without introducing authentication-provider assumptions or duplicating domain logic in `apps/web`.

## Scope
- Define the request-to-`ApplicationContext` transport contract.
- Require organization and actor context before tenant-scoped application surfaces execute.
- Keep the web layer free of domain business rules and persistence access.
- Fail closed when tenant context is absent.
- Prepare the web application for an upstream authenticated identity provider or trusted edge adapter.

## Architecture
`HTTP request → request context adapter → ApplicationContext → application use case → domain/infrastructure composition`

The web adapter translates transport identity into `ApplicationContext`; it does not perform domain authorization. Authorization remains at the application boundary through `UseCaseExecutor`.

## Context contract
Trusted upstream metadata:
- `x-creative-lab-organization-id`
- `x-creative-lab-actor-id`
- optional `x-correlation-id`

These headers are **not an authentication mechanism**. They are an integration contract for an authenticated upstream boundary. Until such a boundary is configured, tenant-scoped routes fail closed.

## Acceptance criteria
- [x] Web request context adapter exists.
- [x] Missing organization/actor context fails closed.
- [x] No hard-coded tenant or actor identity remains in tenant-scoped UI.
- [x] ApplicationContext uses application package types.
- [x] Web layer does not import persistence adapters.
- [x] Authorization remains owned by the application executor.
- [x] Vercel monorepo deployment remains supported.
- [ ] Authenticated identity-provider integration is a subsequent governed epic.
- [ ] Real application composition/use-case data is a subsequent governed slice.

## Out of scope
Authentication provider selection, session management, user provisioning, RBAC policy implementation, database migrations, and domain model changes.

## Governance references
Platform Constitution; ADR-005 Authorization & Tenant Isolation; ADR-008 Application Layer Architecture; ADR-010 Deployment & Runtime Boundary.

## Status rationale
This epic establishes the runtime boundary foundation without claiming authentication or persistence integration that has not been specified and implemented.
