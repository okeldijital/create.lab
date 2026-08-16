# BUILD Registry

This registry is the authoritative index of BUILD-level implementation work in `create.lab`.

BUILD documents remain the detailed source for scope, constraints, acceptance criteria, and validation requirements. This registry reconciles those documents with repository history so implementation status is not inferred from document wording alone.

## Current Registry

| Build | Title | Repository Status | Implementation Status | Validation Status | Evidence |
|---|---|---|---|---|---|
| BUILD-001 | Application Layer Foundation | Present on `main` | Implemented | Document records acceptance criteria as complete | `docs/builds/BUILD-001.md` |
| BUILD-002 | Infrastructure Foundation | Merged to `main` | Implemented | Full local validation still explicitly required by BUILD-002 | `docs/builds/BUILD-002.md`, merge commit `43f61398a6ae42f349f198b7ea3cdbf3b988d140` |

## Status Rules

- **Planned** — BUILD is defined but implementation has not begun.
- **In progress** — implementation exists on a working branch or is not yet merged to `main`.
- **Merged** — implementation has been merged to `main`, but final validation requirements may remain open.
- **Implemented** — implementation and acceptance criteria are recorded as complete.
- **Validated** — implementation is merged and required validation has been completed and evidenced.

A BUILD must not be marked **Validated** solely because its implementation was merged. Validation evidence is required.

## Reconciliation Notes

### BUILD-001

`BUILD-001.md` declares the Application Layer Foundation **Implemented** and records all listed acceptance criteria as complete. The registry therefore records BUILD-001 as implemented.

### BUILD-002

`BUILD-002.md` currently says `Implementation in progress — local validation required`. Repository history subsequently records `build: merge BUILD-002 infrastructure foundation` on commit `43f61398a6ae42f349f198b7ea3cdbf3b988d140`, so the repository state is ahead of the BUILD document's status wording.

The registry therefore separates the two facts:

1. **Implementation:** merged to `main`.
2. **Validation:** not promoted to Validated because the BUILD document explicitly requires full local typecheck, lint, test, build, dependency, and scaffold validation.

This avoids falsely closing BUILD-002 while also avoiding the opposite error of treating an already-merged implementation as merely unstarted.

## Scope Boundary

The BUILD registry tracks platform/build-layer progression only. EPIC implementation status is tracked separately under `docs/epics/`. A BUILD may provide infrastructure required by multiple EPICs; an EPIC completion does not automatically close a BUILD, and a BUILD merge does not automatically complete an EPIC.

## Next Reconciliation Action

Before the next BUILD is declared complete, attach explicit validation evidence to its BUILD record and update this registry from repository history rather than relying on manually remembered status.
