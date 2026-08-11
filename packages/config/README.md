# @creative-lab/config

> Centralized shared configuration presets — BUILD-000A.

## Purpose

Single home for shared tooling and platform configuration presets. Packages and
applications consume these presets rather than owning independent copies of
ESLint, TypeScript, Prettier, Vitest, Tailwind, Commitlint, or lint-staged
configuration.

## Structure

```
packages/config/
├── eslint/           # ESLint flat-config preset
├── prettier/         # Prettier options
├── typescript/       # Shared tsconfig bases
├── tailwind/         # Tailwind preset scaffold
├── vitest/           # Shared Vitest test config
├── commitlint/       # Commitlint preset scaffold
├── lint-staged/      # lint-staged preset scaffold
├── shared/           # Shared constants
├── package.json
└── README.md
```

## Exports

| Export path                               | Purpose                    |
| ----------------------------------------- | -------------------------- |
| `@creative-lab/config/eslint`             | ESLint flat config factory |
| `@creative-lab/config/prettier`           | Prettier options           |
| `@creative-lab/config/typescript/base`    | Base TypeScript options    |
| `@creative-lab/config/typescript/library` | Library package tsconfig   |
| `@creative-lab/config/tailwind`           | Tailwind preset scaffold   |
| `@creative-lab/config/vitest`             | Shared Vitest config       |
| `@creative-lab/config/commitlint`         | Commitlint rules scaffold  |
| `@creative-lab/config/lint-staged`        | lint-staged scaffold       |
| `@creative-lab/config/shared/constants`   | Shared constants           |

## Dependency rules

May import: **none** (internal platform packages).

See [package-dependencies](../../docs/standards/package-dependencies.md).

## Authority

- Platform Constitution Title III
- Package Classification: Platform Configuration
- BUILD-000A-03

## Notes

Presets are project-agnostic. Application-specific wiring (paths, plugins that
only one app needs) remains at the consuming root or app boundary, extending
these presets.
