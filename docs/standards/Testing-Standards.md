# Testing Standards

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | Testing Standards                            |
| Document Identifier | STD-TESTING-STANDARDS                        |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Engineering                         |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | 2026-08-06                                   |

---

## Authority

ADR-010 Testing Strategy; Constitution Article 13.

## Runner

- Vitest for unit and package integration tests.
- Workspace configuration: `vitest.workspace.ts`, `vitest.shared.ts`.

## File placement

- Co-locate `*.test.ts` / `*.spec.ts` with source under `src/` (packages) or
  app folders.
- Shared utilities: `@creative-lab/test-utils`.

## Expectations by layer

| Layer          | Focus                                     |
| -------------- | ----------------------------------------- |
| Unit           | Invariants, pure logic, policies          |
| Integration    | Repositories, adapters, package contracts |
| Acceptance/E2E | User-visible flows (added when UI exists) |

## Quality

1. Tests must be deterministic.
2. Prefer arrange-act-assert clarity.
3. Do not test implementation details that make refactors brittle without
   protecting behavior.
4. Coverage thresholds start at foundation defaults and increase with domain code.

## CI

- `pnpm test` must pass.
- `passWithNoTests` is enabled for scaffolding packages until tests exist.

## BUILD-000

No domain tests required. Harness only.
