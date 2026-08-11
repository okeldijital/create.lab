# @creative-lab/ui

> Shared UI package — scaffolding only (BUILD-000A).

## Purpose

Single source of truth for every reusable interface primitive on the Creative
Lab platform. Applications (`apps/web`, and future surfaces) consume UI from
this package rather than duplicating components.

## Structure

```
packages/ui/
├── src/
│   ├── foundations/     # colors, typography, spacing, radius, elevation, motion
│   ├── tokens/
│   ├── icons/
│   ├── primitives/      # Box, Stack, Grid, Flex, Container
│   ├── components/      # Button, Input, Card, Dialog, …
│   ├── layouts/
│   ├── hooks/
│   ├── providers/
│   ├── utils/
│   └── index.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Scaffolding status

Directory structure is reserved. **No React implementation** is present under
BUILD-000A. Leaf directories use `.gitkeep` until components are authorized.

## Dependency rules

May import: `@creative-lab/core`, `@creative-lab/config`.

Must not import domain packages or `@creative-lab/infrastructure`.

See [package-dependencies](../../docs/standards/package-dependencies.md).

## Authority

- Platform Constitution Title II
- ADR-008 Package Boundaries
- Package Classification: Presentation Library
- BUILD-000A-02

## Development

```bash
pnpm --filter @creative-lab/ui build
pnpm --filter @creative-lab/ui typecheck
pnpm --filter @creative-lab/ui test
pnpm --filter @creative-lab/ui lint
```
