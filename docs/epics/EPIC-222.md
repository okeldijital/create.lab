# EPIC-222 — Identity, Organization Membership & Authorization Boundary

**Status:** In Progress
**Depends on:** EPIC-201, EPIC-221, ADR-005

## Purpose

Define and implement the identity and organization-membership boundary required to provide tenant-scoped authorization without coupling domain packages to an authentication provider or transport mechanism.

## Scope

- Canonical actor identity model at the application boundary.
- Organization membership as the tenant authorization relationship.
- Explicit membership roles and permission vocabulary.
- Organization-scoped authorization policy.
- Mapping of trusted authenticated identity to `ApplicationContext`.
- Authorization repository ports and composition-root implementation boundary.
- Deny-by-default behavior for absent, invalid, inactive, or cross-organization context.
- Test doubles and acceptance tests for authorization decisions.

## Out of scope

- Selection of a specific external identity provider.
- UI authentication screens.
- Domain-specific business authorization beyond the shared permission model.
- Cross-tenant administrative access unless separately specified by an ADR.

## Architectural rules

1. Authentication establishes identity; authorization establishes what that identity may do.
2. The application layer is the authorization enforcement boundary.
3. Domain packages do not depend on authentication providers, sessions, cookies, JWT libraries, or web transports.
4. Organization membership is required for tenant-scoped permissions.
5. Missing or invalid organization context is denied by default.
6. Cross-tenant resource access is denied unless an explicit governed administrative capability exists.
7. Authorization implementations are injected through the composition root behind `AuthorizationService`.
8. Authorization decisions must be deterministic for the same context, permission, and policy state.
9. Authorization failures must not leak protected resource existence across tenant boundaries.
10. All authorization behavior is covered by automated tests before production acceptance.

## Permission vocabulary

The implementation uses the existing `Permission` type as the canonical vocabulary. Applications and web routes must not introduce ad-hoc permission strings.

The governed capability set is:

`organization.create`, `organization.archive`, `organization.read`,
`project.create`, `project.read`, `project.archive`,
`production.start`, `production.read`,
`asset.create`, `asset.read`, `asset.archive`,
`review.approve`, `review.read`,
`delivery.create`, `delivery.read`,
`invoice.create`, `invoice.read`, `invoice.approve`,
`quote.create`, `quote.read`, `quote.issue`,
`contract.activate`, `contract.read`,
`engagement.create`, `engagement.read`,
`portfolio.create`, `portfolio.read`,
`knowledge.create`, `knowledge.read`, `knowledge.search`.

## Role-to-permission matrix v1

| Role | Governed access |
|---|---|
| `owner` | All permissions in the governed capability set. |
| `admin` | All permissions except `organization.create` and `organization.archive`. |
| `member` | Read access to organization/project/production/asset/review/delivery/invoice/quote/contract/engagement/portfolio/knowledge, plus `asset.create` and `knowledge.create`. |

This matrix is the initial policy baseline for EPIC-222 and must be revised through governance documentation if product requirements require additional roles or permissions.

## Acceptance criteria

- [x] Actor identity can be represented independently of authentication provider.
- [x] Organization membership is represented independently of persistence technology.
- [x] Role/permission policy is explicit and testable.
- [x] `AuthorizationService` has a policy implementation behind its application-layer port.
- [x] Missing organization membership denies tenant-scoped permissions.
- [x] Cross-organization access denies by default.
- [ ] Application use cases enforce authorization before protected operations.
- [ ] Web routes do not implement authorization rules themselves.
- [x] No domain package imports authentication or transport concerns.
- [x] Unit tests cover allow/deny and tenant-isolation cases.
- [ ] Persistence-backed membership adapter is wired through the composition root.
- [ ] Vercel production deployment passes with the authorization implementation.
- [ ] Governance documentation and Notion project tracker are updated to completion.

## Governance references

- Platform Constitution — organization-first tenancy, dependency direction, authorization and testing.
- ADR-005 — Authorization & Tenant Isolation.
- EPIC-201 — Organization Management.
- EPIC-221 — Application Runtime & Tenant Context Integration.
