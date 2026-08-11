# Payload Standards

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | Payload Standards                            |
| Document Identifier | STD-PAYLOAD-STANDARDS                        |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Engineering                         |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | 2026-08-06                                   |

---

## Authority

ADR-007 Payload Integration.

## Placement

- Payload application code lives in `apps/cms`.
- Collections: `apps/cms/collections`
- Access: `apps/cms/access`
- Hooks: `apps/cms/hooks`
- Utilities: `apps/cms/utilities`

## Rules

1. Collections are adapters; domain invariants live in packages.
2. Hooks call application services; they do not re-implement business rules.
3. Access functions map to authorization policies (ADR-005).
4. Do not import `apps/cms` from packages.
5. Avoid leaking Payload `req` types into domain packages; map at the boundary.
6. Naming of collections should align with ubiquitous language where they
   represent domain concepts.

## BUILD-000

No collections, access rules, or Payload configuration are implemented.
Structure only.
