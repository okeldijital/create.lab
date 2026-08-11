# @creative-lab/collaboration

> Scaffolding only — BUILD-000 platform reconstitution.

## Purpose

Package `collaboration` is reserved for the corresponding bounded context on the Creative Lab platform.

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
packages/collaboration/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Development

```bash
pnpm --filter @creative-lab/collaboration build
pnpm --filter @creative-lab/collaboration typecheck
pnpm --filter @creative-lab/collaboration test
pnpm --filter @creative-lab/collaboration lint
```
