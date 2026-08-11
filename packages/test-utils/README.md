# @creative-lab/test-utils

> Scaffolding only — BUILD-000 platform reconstitution.

## Purpose

Package `test-utils` is reserved for the corresponding bounded context on the Creative Lab platform.

**No domain implementation is present.** This package establishes structure, exports, and workspace integration only.

## Authority

- Platform Constitution (Title II — Architecture)
- ADR-008 Package Boundaries
- ADR-009 Domain Driven Design

## Dependency rules

See `scripts/check-deps.mjs` and the monorepo dependency graph:

```
core → organization → workforce → capacity → scheduling → allocation
```

## Structure

```
packages/test-utils/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Development

```bash
pnpm --filter @creative-lab/test-utils build
pnpm --filter @creative-lab/test-utils typecheck
pnpm --filter @creative-lab/test-utils test
pnpm --filter @creative-lab/test-utils lint
```
