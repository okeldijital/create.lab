# Folder Structure Standards

| Field               | Value                                            |
| ------------------- | ------------------------------------------------ |
| Document Title      | Folder Structure Standards                       |
| Document Identifier | STD-FOLDER-STRUCTURE                             |
| Version             | BUILD-000A                                       |
| Status              | Accepted                                         |
| Last Updated        | 2026-08-06                                       |
| Supersedes          | BUILD-000 Folder Structure (pre platform layers) |
| Owner               | Platform Engineering                             |
| Approved By         | BUILD-000A                                       |
| Effective Date      | 2026-08-06                                       |

---

## Repository root

```
creative-lab/
├── apps/                    # Deployable applications
├── packages/                # Bounded contexts & platform libraries
├── docs/                    # Constitution, ADRs, epics, standards, architecture
├── tooling/                 # Shared tooling (reserved)
├── scripts/                 # Repo automation
├── .github/                 # CI workflows
├── platform.manifest.json   # Platform composition (BUILD-000A)
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json       # Extends packages/config/typescript/base
└── README.md
```

## Package layout

### Standard library package

```
packages/<name>/
├── src/
│   └── index.ts          # Public API
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### Core (Domain Kernel — CORE-001)

```
packages/core/src/
├── aggregates/        # AggregateRoot
├── entities/          # Entity
├── value-objects/     # ValueObject
├── events/            # DomainEvent
├── errors/            # DomainError
├── identity/          # Identity
├── specifications/    # Specification
├── clock/             # Clock, SystemClock, TestClock
├── guards/            # Guard
├── results/           # Result, Success, Failure
├── types/
├── utils/
├── authorization/     # reserved scaffold
├── repositories/      # reserved scaffold
├── validation/        # reserved scaffold
└── index.ts
```

### Infrastructure

```
packages/infrastructure/src/
├── config/
├── logging/
├── storage/
├── email/
├── queue/
├── cache/
├── search/
├── payload/
├── auth/
├── integrations/
├── scheduler/
├── events/
├── adapters/
├── utils/
└── index.ts
```

### UI (Presentation Library)

```
packages/ui/src/
├── foundations/
├── tokens/
├── icons/
├── primitives/
├── components/
├── layouts/
├── hooks/
├── providers/
├── utils/
└── index.ts
```

### Config (Platform Configuration)

```
packages/config/
├── eslint/
├── prettier/
├── typescript/
├── tailwind/
├── vitest/
├── commitlint/
├── lint-staged/
├── shared/
├── package.json
└── README.md
```

Config is presets-only (no domain `src/` tree required).

## Application layouts

### Web

```
apps/web/
├── app/
├── components/      # App-specific composition; shared UI from @creative-lab/ui
├── lib/
├── actions/
├── hooks/
└── styles/
```

### CMS

```
apps/cms/
├── collections/
├── access/
├── hooks/
└── utilities/
```

## Documentation layout

```
docs/
├── constitution/
├── architecture/     # domain-map, package-classification, …
├── adr/
├── epics/
├── standards/        # including package-dependencies
└── decisions/
```

## Rules

1. Domain code lives in `packages/*`, not apps.
2. Apps compose packages; packages never import apps.
3. Do not introduce new top-level roots without an ADR or Constitution amendment.
4. Empty directories required by standards are preserved with `.gitkeep` or stub modules.
5. Shared tooling configuration is owned by `@creative-lab/config`.
6. Shared UI is owned by `@creative-lab/ui`.
7. Technical adapters are owned by `@creative-lab/infrastructure`.
