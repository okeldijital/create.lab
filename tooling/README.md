# Tooling

Shared engineering tooling for the Creative Lab monorepo.

## Scope (BUILD-000)

This directory reserves space for future shared tooling packages (codegen,
eslint presets, tsconfig presets, etc.). Root-level ESLint, Prettier, TypeScript,
Vitest, and Turbo configuration live at the repository root for permanence and
discoverability.

## Rules

- Tooling must not contain domain logic.
- Prefer promoting repeated configuration here once multiple consumers exist.
