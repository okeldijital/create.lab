# Creative Lab

**creative-lab** — production engineering foundation for the Creative Lab platform.

This repository was reconstituted under **BUILD-000 — Platform Reconstitution**
and refined under **BUILD-000A — Foundation Refinement**. It establishes the
permanent monorepo, documentation authority, package and application scaffolding,
platform layers, CI, and testing baseline. **No business functionality is
implemented.**

---

## Purpose

Provide a durable platform foundation from which epic reconstruction
(beginning with **EPIC-201**) can proceed without re-litigating structure,
authority, or quality gates.

## Architecture

### Authority order

1. [Platform Constitution](docs/constitution/Platform-Constitution.md)
2. [Architecture Decision Records](docs/adr/)
3. [Epic Specifications](docs/epics/)
4. [Engineering Standards](docs/standards/)
5. Implementation

### Platform layers

| Layer            | Package                           | Role                           |
| ---------------- | --------------------------------- | ------------------------------ |
| Domain Kernel    | `@creative-lab/core`              | Framework-agnostic contracts   |
| Infrastructure   | `@creative-lab/infrastructure`    | Technical adapters & providers |
| Configuration    | `@creative-lab/config`            | Shared tooling presets         |
| Presentation     | `@creative-lab/ui`                | Shared UI primitives           |
| Business domains | `organization` → … → `allocation` | Bounded contexts               |
| Satellites       | `collaboration`, `assets`         | Org-scoped satellites          |

### Dependency graph

Formal matrix: [docs/standards/package-dependencies.md](docs/standards/package-dependencies.md).

```
core / config          (no internal deps)
  ├── infrastructure   → core, config
  └── ui               → core, config

organization → workforce → capacity → scheduling → allocation
  (domains may also import core, infrastructure, config)
```

Satellite packages `collaboration` and `assets` may depend on `core` and
`organization` only. Circular and reverse dependencies are forbidden and
enforced by `pnpm run lint:deps`.

See [docs/architecture](docs/architecture/README.md),
[domain map](docs/architecture/domain-map.md),
[package classification](docs/architecture/package-classification.md),
and [ADR-008](docs/adr/ADR-008-package-boundaries.md).

### Platform manifest

Composition source of truth: [`platform.manifest.json`](platform.manifest.json).

## Repository layout

```
creative-lab/
├── apps/
│   ├── web/                 # End-user web app (scaffold)
│   └── cms/                 # Payload CMS host (scaffold)
├── packages/
│   ├── core/                # Domain kernel
│   ├── infrastructure/      # Platform infrastructure (BUILD-000A)
│   ├── config/              # Shared config presets (BUILD-000A)
│   ├── ui/                  # Shared UI library (BUILD-000A)
│   ├── organization/
│   ├── workforce/
│   ├── capacity/
│   ├── scheduling/
│   ├── allocation/
│   ├── collaboration/
│   ├── assets/
│   └── test-utils/
├── docs/
│   ├── constitution/
│   ├── architecture/
│   ├── adr/
│   ├── epics/
│   ├── standards/
│   └── decisions/
├── tooling/
├── scripts/
├── .github/workflows/
├── platform.manifest.json
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── README.md
```

## Development workflow

### Prerequisites

- Node.js ≥ 20
- pnpm 9

### Install

```bash
pnpm install
```

### Common commands

| Command                           | Purpose                                |
| --------------------------------- | -------------------------------------- |
| `pnpm run build`                  | Build all packages and apps (Turbo)    |
| `pnpm run typecheck`              | TypeScript across the workspace        |
| `pnpm run lint`                   | ESLint across the workspace            |
| `pnpm run lint:deps`              | Enforce package dependency graph       |
| `pnpm run test`                   | Vitest across the workspace            |
| `pnpm run format`                 | Prettier write                         |
| `pnpm run format:check`           | Prettier check                         |
| `pnpm run check`                  | deps → typecheck → lint → test → build |
| `node scripts/scaffold-check.mjs` | Verify required scaffolding exists     |

### Quality gates

The repository must fail when any of the following occur:

- TypeScript errors
- Lint errors
- Circular or forbidden dependencies
- Workspace / Turbo task failures
- Broken imports
- Failed tests

CI pipeline (no deployment): **Install → Typecheck → Lint → Tests → Build**
(plus dependency graph and scaffold checks).

## Package overview

| Package                        | Role                                            |
| ------------------------------ | ----------------------------------------------- |
| `@creative-lab/core`           | Domain kernel — contracts only                  |
| `@creative-lab/infrastructure` | Platform infrastructure — adapters (scaffold)   |
| `@creative-lab/config`         | Shared tooling configuration presets            |
| `@creative-lab/ui`             | Shared UI library (scaffold, no components yet) |
| `@creative-lab/organization`   | Organization bounded context — scaffold         |
| `@creative-lab/workforce`      | Workforce bounded context — scaffold            |
| `@creative-lab/capacity`       | Capacity bounded context — scaffold             |
| `@creative-lab/scheduling`     | Scheduling bounded context — scaffold           |
| `@creative-lab/allocation`     | Allocation bounded context — scaffold           |
| `@creative-lab/collaboration`  | Collaboration bounded context — scaffold        |
| `@creative-lab/assets`         | Assets bounded context — scaffold               |
| `@creative-lab/test-utils`     | Shared test helpers — scaffold                  |
| `@creative-lab/web`            | Web application — scaffold                      |
| `@creative-lab/cms`            | CMS application — scaffold                      |

## Documentation links

| Document               | Path                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Platform Constitution  | [docs/constitution/Platform-Constitution.md](docs/constitution/Platform-Constitution.md)   |
| Domain map             | [docs/architecture/domain-map.md](docs/architecture/domain-map.md)                         |
| Package classification | [docs/architecture/package-classification.md](docs/architecture/package-classification.md) |
| Dependency matrix      | [docs/standards/package-dependencies.md](docs/standards/package-dependencies.md)           |
| Platform layers        | [docs/standards/Platform-Layers.md](docs/standards/Platform-Layers.md)                     |
| Platform manifest      | [platform.manifest.json](platform.manifest.json)                                           |
| ADR index              | [docs/adr/README.md](docs/adr/README.md)                                                   |
| Epic library           | [docs/epics/README.md](docs/epics/README.md)                                               |
| Engineering standards  | [docs/standards/README.md](docs/standards/README.md)                                       |
| Architecture notes     | [docs/architecture/README.md](docs/architecture/README.md)                                 |
| Decision log           | [docs/decisions/README.md](docs/decisions/README.md)                                       |

## BUILD-000 / BUILD-000A constraints

The foundation **must not** implement: Organization/Workforce/Capacity/Scheduling/Allocation
domain logic, Payload collections, repositories, services, UI components, events, activity
integration, authentication, authorization logic, or database schemas.

At completion of BUILD-000A, the monorepo is architecturally stable and ready to
begin **EPIC-201 — Organization Management**.
