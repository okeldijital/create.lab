# Validation Standards

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | Validation Standards                         |
| Document Identifier | STD-VALIDATION-STANDARDS                     |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Engineering                         |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | 2026-08-06                                   |

---

## Authority

Constitution Article 11; supports repository and domain integrity.

## Rules

1. Validate at trust boundaries (HTTP/API/CMS inputs, message consumers).
2. Domain invariants are enforced in the domain model / domain services, not
   only in UI forms.
3. Prefer schema validation for external input and explicit domain checks for
   business rules.
4. Error messages for users must not leak secrets or cross-tenant data.
5. Shared validation primitives belong in `packages/core/src/validation` when
   implemented.

## Multi-tenancy

- Organization identifiers on input must be validated against the actor’s
  permitted organizations.

## BUILD-000

No validation schemas or libraries wired into domain code.
