# Authorization Standards

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | Authorization Standards                      |
| Document Identifier | STD-AUTHORIZATION-STANDARDS                  |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Engineering                         |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | 2026-08-06                                   |

---

## Authority

ADR-005 Authorization; Constitution Articles 5–6.

## Principles

1. Deny by default for tenant resources.
2. Evaluate actor + organization membership + role/permission.
3. Enforce in application layer, not UI alone.
4. CMS access adapters must express the same intent as domain policies.

## Implementation conventions (when authorized by epics)

1. Shared contracts live in `packages/core/src/authorization`.
2. Resource-specific policies live with the owning domain package.
3. Missing organization context is a hard failure for tenant operations.
4. Record security-relevant denials in logs/activity as defined by epics.

## Testing

- Policy unit tests with matrix of roles and resources.
- Adapter tests ensuring CMS/web parity for critical paths.

## BUILD-000

No authorization logic implemented. Scaffolding only.
