# ADR-001: Organization First

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | ADR 001 organization first                   |
| Document Identifier | ADR-001                                      |
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

Creative Lab serves multiple organizations. Historical platforms often model
features around individual users first, which produces ambiguous ownership,
leaky authorization, and incorrect defaults for multi-tenant products.

The Platform Constitution (Title II, Article 5) requires Organization-first
design. This ADR records the architectural decision that implements that
principle across bounded contexts.

## Decision

1. **Organization is the root tenancy aggregate.** Membership, roles, and
   tenant identity derive from Organization.
2. **Domain aggregates are organization-scoped by default.** Workforce,
   capacity, schedules, allocations, assets, and collaboration artifacts
   belong to an Organization unless an ADR explicitly designates a
   platform-global exception.
3. **APIs and repositories require organization context** for tenant data
   access. Operations without organization scope are invalid for tenant data.
4. **User identity alone is insufficient** for authorization; organizational
   membership and role must participate in access decisions (see ADR-005).
5. **Cross-organization references are exceptional** and must be explicit,
   validated, and auditable.

## Consequences

### Positive

- Clear tenancy model for all future epics.
- Consistent authorization and query scoping.
- Reduced risk of cross-tenant data exposure.

### Negative

- Additional required parameters and invariants on domain operations.
- Migration complexity if any future global-user features appear.

### Neutral

- Platform administration pathways remain possible but must be separately
  designed and ADR-governed.

## Alternatives Considered

1. **User-first multi-tenancy** — Rejected: blurs ownership and complicates
   B2B workflows.
2. **Workspace as root without Organization entity** — Rejected: weaker
   ubiquitous language alignment with business stakeholders.
3. **Hybrid user-global + org-optional** — Rejected: produces dual paths and
   inconsistent security posture.
