# BUILD Registry

This registry is the authoritative index of BUILD-level implementation work in `create.lab`.

BUILD documents remain the detailed source for scope, constraints, acceptance criteria, and validation requirements. This registry reconciles those documents with repository history so implementation status is not inferred from stale branch wording.

## Current Registry

| Build | Repository Status | Validation Status |
|---|---|---|
| BUILD-001 | Implemented on `main` | Accepted criteria recorded complete |
| BUILD-002 | Implemented on `main` | Complete as foundation; cumulative validation evidenced by BUILD-016 |
| BUILD-003 | Implemented on `main` | Local validation evidenced |
| BUILD-004 | Implemented on `main` | Local validation evidenced |
| BUILD-005 | Implemented on `main` | Local validation evidenced |
| BUILD-006 | Implemented on `main` | Local validation evidenced |
| BUILD-007 | Implemented on `main` | Local validation evidenced |
| BUILD-008 | Implemented on `main` | Local validation evidenced |
| BUILD-009 | Implemented on `main` | Local validation evidenced |
| BUILD-010 | Implemented on `main` | Local validation evidenced |
| BUILD-011 | Implemented on `main` | Local validation evidenced |
| BUILD-012 | Implemented on `main` | Local validation evidenced |
| BUILD-013 | Implemented on `main` | Local validation evidenced |
| BUILD-014 | Implemented on `main` | Local validation evidenced |
| BUILD-015 | Implemented on `main` | Local validation evidenced |
| BUILD-016 | Implemented on `main` | Local validation evidenced; 1,295/1,295 tests passed |

## Cumulative BUILD-016 Gate

The cumulative `build/016-allocation-persistence` implementation was promoted to `main` through PR #4.

Measured validation:

- 1,295 / 1,295 tests passed.
- Install gate passed.
- Typecheck passed.
- Lint passed.
- Build passed.
- Dependency graph check passed.
- Scaffold integrity check passed.
- Live PostgreSQL integration was not available and is **not** claimed as passing.

## Status Rules

- **Planned** — BUILD is defined but implementation has not begun.
- **In progress** — implementation exists on a working branch or is not yet merged to `main`.
- **Merged** — implementation has been merged to `main`, but final validation may remain open.
- **Implemented** — implementation and acceptance criteria are recorded as complete.
- **Validated** — implementation is merged and required validation has been completed and evidenced.

## Current Boundary

BUILD-016 establishes the current persistence/composition baseline. The end-user web and CMS applications remain scaffolds. The next implementation phase should therefore move into application/product delivery rather than another persistence vertical slice.

## Hosting Readiness

The connected Vercel `create-lab` project currently fails after a successful repository build because its project configuration expects an output directory named `public`. This is a scaffold-era deployment configuration issue; it is not evidence of a failed BUILD-016 repository validation. The configuration should be resolved when the web application establishes its deployable output contract.

## Next Action

Select and implement the first application/product delivery epic from the reconciled roadmap. Keep GitHub repository validation and Vercel deployment readiness tracked separately so scaffold-era hosting failures do not get conflated with domain/infrastructure correctness.
