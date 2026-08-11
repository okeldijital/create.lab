# ADR-005: Authorization

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | ADR 005 authorization                        |
| Document Identifier | ADR-005                                      |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Architecture                        |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | BUILD-000                                    |

---

## Status

Accepted

## Context

Authentication establishes identity; authorization establishes permission.
Creative Lab requires organization-aware access control across web and CMS
surfaces without embedding ad-hoc checks inconsistently.

## Decision

1. Authorization is **organization-scoped** and evaluates actor identity,
   membership, and role (and finer permissions as defined by epics).
2. Core provides shared **authorization primitives and contracts**; domain
   packages express resource-specific policies.
3. Deny by default for tenant resources when context is missing or membership
   is absent.
4. Authorization checks occur in application services / use-case boundaries,
   not only in the UI.
5. CMS access rules and web application rules must implement the same policy
   intent for the same resources, even if adapters differ.
6. Authentication mechanism choice is subordinate; this ADR does not select a
   vendor IdP.

## Consequences

### Positive

- Consistent security posture across apps.
- Testable policies independent of UI.
- Alignment with Organization-first tenancy.

### Negative

- Policy design requires up-front RBAC modeling per epic.
- Risk of duplication if adapters diverge without shared tests.

## Alternatives Considered

1. **UI-only authorization** — Rejected: insecure.
2. **Global roles without organization** — Rejected: violates multi-tenancy.
3. **Per-row ACLs for every entity from day one** — Deferred: high complexity;
   start with role-based org policies and refine via epics.
