# ADR-010: Testing Strategy

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | ADR 010 testing strategy                     |
| Document Identifier | ADR-010                                      |
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

The reconstituted platform must remain correct as epics are rebuilt. Testing
must be systematic without blocking foundation work with premature domain
tests.

## Decision

1. **Vitest** is the default unit/integration test runner for packages and
   apps in the monorepo.
2. Tests live next to code or in clearly named `*.test.ts` / `*.spec.ts` files
   within the owning package/app.
3. Layers of testing:
   - **Unit**: domain rules, pure functions, policies.
   - **Integration**: repositories, adapters, package boundaries.
   - **Acceptance / E2E**: deferred to epic delivery when UI flows exist;
     tooling may be added by later ADRs.
4. Shared helpers live in `@creative-lab/test-utils`.
5. Coverage reporting is configured at the foundation; thresholds may rise per
   epic but must not fall without justification.
6. CI runs tests on every pull request; failures block merge.
7. BUILD-000 establishes infrastructure only; **no domain tests** are required
   until domain code exists.
8. Flaky tests are treated as defects; quarantine requires an issue and time
   bound.

## Consequences

### Positive

- Uniform developer experience.
- Early feedback in CI.
- Shared utilities prevent divergent test harnesses.

### Negative

- Over-reliance on unit tests can miss integration bugs if teams skip higher
  layers later.
- Coverage numbers can incentivize low-value tests if misused.

## Alternatives Considered

1. **Jest as default** — Rejected: Vitest chosen for ESM/monorepo speed and
   Vite-aligned DX.
2. **No tests until after full rebuild** — Rejected: foundation without
   harness delays every epic.
3. **E2E-only strategy** — Rejected: slow feedback and poor domain invariant
   protection.
