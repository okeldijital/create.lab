# Repository Standards

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | Repository Standards                         |
| Document Identifier | STD-REPOSITORY-STANDARDS                     |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Engineering                         |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | 2026-08-06                                   |

---

## Authority

ADR-003 Repository Pattern; Constitution Article 9.

## Rules

1. Define repository interfaces in the owning domain package.
2. Method names use domain language and imply organization scoping for tenant data.
3. Do not expose raw database clients through repository interfaces.
4. Prefer returning domain types, not persistence documents.
5. Persistence mapping belongs in infrastructure adapters.
6. Transactions spanning multiple aggregates are application-layer concerns and
   must respect context boundaries.
7. Query-only use cases may use dedicated query ports when repositories become
   awkward; document them in the epic.

## Testing

- Provide fakes or in-memory implementations for unit tests of application services.
- Integration tests cover concrete adapters when implemented.

## Naming

- Interface: `OrganizationRepository` (example).
- Implementation: `PayloadOrganizationRepository`, `PostgresOrganizationRepository`, etc.

## BUILD-000

No repository implementations are present. Structure only.
