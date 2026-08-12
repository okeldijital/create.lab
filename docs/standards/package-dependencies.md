# Package Dependency Matrix

| Field               | Value                                                   |
| ------------------- | ------------------------------------------------------- |
| Document Title      | Package Dependency Matrix                               |
| Document Identifier | STD-PKG-DEPS                                            |
| Version             | BUILD-001                                               |
| Status              | Accepted                                                |
| Last Updated        | 2026-08-07                                              |
| Supersedes          | Informal hierarchy in ADR-008 / README (pre–BUILD-000A) |
| Owner               | Platform Engineering                                    |
| Approved By         | BUILD-001                                               |
| Effective Date      | 2026-08-06                                              |

---

## Purpose

This document is the formal engineering standard for allowed package dependencies
in the Creative Lab monorepo. Mechanical enforcement lives in
`scripts/check-deps.mjs`. ADR-008 records the architectural decision; this
standard is the operational matrix.

## Authority

- Platform Constitution Title II Article 10
- ADR-008 Package Boundaries
- Package Classification (`docs/architecture/package-classification.md`)

---

## Allowed imports

| Package          | May import                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `core`           | _(none)_                                                                                  |
| `config`         | _(none)_                                                                                  |
| `ui`             | `core`, `config`                                                                          |
| `infrastructure` | `core`, `config`                                                                          |
| `organization`   | `core`, `infrastructure`, `config`                                                        |
| `workforce`      | `organization`, `core`, `infrastructure`, `config`                                        |
| `capacity`       | `workforce`, `organization`, `core`, `infrastructure`, `config`                           |
| `scheduling`     | `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`               |
| `allocation`     | `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `production`     | `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `operations`     | `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `projects`       | `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |

### Satellite packages (BUILD-000 retention)

| Package         | May import             |
| --------------- | ---------------------- |
| `collaboration` | `core`, `organization` |
| `assets`         | `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `review`         | `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `delivery`       | `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `billing`        | `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `crm`            | `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `services`       | `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `quotation`      | `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `contracts`      | `quotation`, `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `engagement`     | `contracts`, `quotation`, `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `portfolio`      | `engagement`, `contracts`, `quotation`, `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `knowledge`      | `portfolio`, `engagement`, `contracts`, `quotation`, `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `application`    | `knowledge`, `portfolio`, `engagement`, `contracts`, `quotation`, `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config` |
| `test-utils`    | _(none)_               |

Any package may list `test-utils` as a **dev** dependency without expanding the
domain layering rules above.

### Applications

| Application | May import                                        |
| ----------- | ------------------------------------------------- |
| `apps/web`  | Any package (compose only; not in package matrix) |
| `apps/cms`  | Any package (compose only; not in package matrix) |

Packages **must never** import applications.

---

## Forbidden

1. **Reverse chain edges** — e.g. `organization` → `workforce`.
2. **Circular dependencies** — any cycle among packages.
3. **Domain → UI** — domain packages must not import `@creative-lab/ui`.
4. **Domain kernel pollution** — `core` must not import any other internal package.
5. **Config isolation** — `config` must not import any other internal package.
6. **Infrastructure isolation from domains** — `infrastructure` must not import
   domain packages (`organization` and downstream).
7. **UI isolation from infrastructure and domains** — `ui` must not import
   `infrastructure` or domain packages.
8. **Unregistered packages** — every `packages/*` entry must appear in this
   matrix and in `scripts/check-deps.mjs`.
9. **Apps from packages** — packages must not depend on `apps/*`.

---

## Reason

Directed dependencies preserve:

- Bounded-context ownership
- Testability without loading the full graph
- Framework-agnostic `core`
- Centralized tooling in `config`
- Clear placement of technical adapters in `infrastructure`
- A single presentation library in `ui`

---

## Examples

### Allowed

```text
@creative-lab/organization  →  @creative-lab/core
@creative-lab/organization  →  @creative-lab/infrastructure
@creative-lab/workforce     →  @creative-lab/organization
@creative-lab/ui            →  @creative-lab/core
@creative-lab/infrastructure → @creative-lab/core
@creative-lab/capacity      →  @creative-lab/workforce
```

### Forbidden

```text
@creative-lab/core          →  @creative-lab/organization   # reverse
@creative-lab/organization  →  @creative-lab/workforce      # reverse chain
@creative-lab/infrastructure → @creative-lab/organization   # infra must not import domain
@creative-lab/ui            →  @creative-lab/organization   # ui must not import domain
@creative-lab/workforce     →  @creative-lab/ui             # domain must not import ui
@creative-lab/config        →  @creative-lab/core           # config has no internal deps
```

---

## Circular dependency examples

**Forbidden cycle:**

```text
organization → workforce → organization
```

**Forbidden multi-package cycle:**

```text
capacity → scheduling → capacity
```

**Forbidden indirect cycle via satellite (illustrative):**

```text
organization → collaboration → organization
```

(Satellites may import `organization`, but `organization` must not import satellites.)

---

## Violation examples

| Scenario                                                    | Why it fails                           |
| ----------------------------------------------------------- | -------------------------------------- |
| `packages/core` adds `@creative-lab/infrastructure`         | `core` may import nothing              |
| `packages/ui` adds `@creative-lab/workforce`                | UI must not import domain packages     |
| `packages/infrastructure` adds `@creative-lab/organization` | Infrastructure must not import domains |
| `packages/allocation` adds `@creative-lab/ui`               | Domain must not import presentation    |
| Two packages mutual `workspace:*` deps                      | Circular dependency                    |
| New package `packages/foo` without matrix entry             | Unregistered package                   |

---

## Enforcement

```bash
pnpm run lint:deps
```

CI runs the same check. Failures are quality-gate failures (Constitution
Article 10 / Article 14).

---

## Change control

Changes to this matrix require:

1. Update of this document
2. Update of `scripts/check-deps.mjs`
3. Update of ADR-008 (or a superseding ADR)
4. Update of `platform.manifest.json` dependencies section
5. Scaffold / documentation cross-links as needed


## BUILD-007 addendum

`infrastructure` may depend on `workforce` (and organization/crm) for concrete repository adapters. Domain packages must not depend on infrastructure implementations or Drizzle/postgres.js.

## BUILD-009 addendum

`infrastructure` may depend on `quotation` for concrete repository adapters implementing EPIC-216 ports. The quotation domain must not import infrastructure, Drizzle, or postgres.js.

## BUILD-010 addendum

`infrastructure` may depend on `contracts` for concrete repository adapters implementing EPIC-217 ports (Contract, ContractVersion, ContractTerm, ContractAmendment). The contracts domain must not import infrastructure, Drizzle, or postgres.js. Direction remains:

```text
@creative-lab/contracts
        ↑
@creative-lab/infrastructure
```

## BUILD-011 addendum

`infrastructure` may depend on `knowledge` for concrete repository adapters implementing EPIC-220 ports (KnowledgeCategory, KnowledgeArticle, KnowledgeVersion, KnowledgeReference). The knowledge domain must not import infrastructure, Drizzle, or postgres.js. Direction remains:

```text
@creative-lab/knowledge
        ↑
@creative-lab/infrastructure
```

## BUILD-012 addendum

`infrastructure` may depend on `capacity` for concrete repository adapters implementing EPIC-203 ports (CapacityProfile, Capability, AvailabilityProfile, WorkingPattern, ResourceCapacity). The capacity domain must not import infrastructure, Drizzle, or postgres.js. Direction remains:

```text
@creative-lab/capacity
        ↑
@creative-lab/infrastructure
```
