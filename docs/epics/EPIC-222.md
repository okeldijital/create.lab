# EPIC-222 — Identity, Organization Membership & Authorization Boundary

**Status:** Proposed / governance specification
**Depends on:** EPIC-201, EPIC-221, ADR-005

## Purpose

Define the identity and organization-membership boundary required to provide tenant-scoped authorization without coupling domain packages to an authentication provider or transport mechanism.

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

## Initial permission vocabulary

The implementation must use the existing `Permission` type as the canonical vocabulary and must not introduce ad-hoc permission strings in applications or web routes.

Initial governed capabilities include the existing authorization port operations:

- `create_project`
- `approve_invoice`
- `archive_asset`
- `create_organization`
- `approve_review`
- `issue_quote`
- `activate_contract`

The final role-to-permission matrix must be explicitly recorded before the concrete policy implementation is accepted.

## Acceptance criteria

- [ ] Actor identity can be represented independently of authentication provider.
- [ ] Organization membership is represented independently of persistence technology.
- [ ] Role/permission policy is explicit and testable.
- [ ] `AuthorizationService` has a production composition-root implementation.
- [ ] Missing organization membership denies tenant-scoped permissions.
- [ ] Cross-organization access denies by default.
- [ ] Application use cases enforce authorization before protected operations.
- [ ] Web routes do not implement authorization rules themselves.
- [ ] No domain package imports authentication or transport concerns.
- [ ] Unit and application integration tests cover allow/deny and tenant-isolation cases.
- [ ] Vercel production deployment passes.
- [ ] Governance documentation and Notion project tracker are updated.

## Governance references

- Platform Constitution — organization-first tenancy, dependency direction, authorization and testing.
- ADR-005 — Authorization & Tenant Isolation.
- EPIC-201 — Organization Management.
- EPIC-221 — Application Runtime & Tenant Context Integration.
