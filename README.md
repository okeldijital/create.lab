# Creative Lab

**creative-lab** is the multi-tenant operations platform for create.lab.
M² Lab is the flagship tenant. GitHub is the implementation authority.

This is not an MVP yet. Domain and persistence foundations are in place.
The product surface is a workspace shell plus organization and project reads.
Authentication is on `fix/auth-002-runtime-identity`, not on `main`.

## Current product path

1. Better Auth session resolves a normalized actor.
2. Organization membership is verified before an application context exists.
3. Application handlers enforce authorization and tenant scope.
4. PostgreSQL adapters serve organization and project reads.
5. `/projects` lists the current organization's projects. `/projects/[projectId]` reads one project.

Missing actor or organization context fails closed. Provider session objects
do not enter domain authorization.

## What is not done

- AUTH-002 is not merged. `main` still accepts trusted identity headers.
- No project create/edit UI.
- No client intake, deposit gate, or delivery flow in the web app.
- `@creative-lab/ui` and `apps/cms` are scaffolds.
- CI on the auth branch has not produced a green run. The latest job failed
  before a runner started (`runner_id` 0). `pnpm-lock.yaml` was not updated
  when `better-auth` was added.

## Architecture

Authority order: Platform Constitution, ADRs, epic specifications, engineering
standards, implementation.

```
core / config
  ├── infrastructure
  └── ui

apps/web  →  application  →  domain packages  →  core
              ↓
infrastructure (PostgreSQL, auth adapter)
```

Formal matrix: [docs/standards/package-dependencies.md](docs/standards/package-dependencies.md).

## Development

- Node.js ≥ 20
- pnpm 9

```bash
pnpm install
pnpm run check
```

| Command | Purpose |
| --- | --- |
| `pnpm run build` | Build all packages and apps |
| `pnpm run typecheck` | TypeScript |
| `pnpm run lint` | ESLint |
| `pnpm run lint:deps` | Package dependency graph |
| `pnpm run test` | Vitest |
| `pnpm run check` | deps, typecheck, lint, test, build |

## Layout

```
apps/web          presentation and transport composition
apps/cms          Payload host scaffold
packages/application
packages/infrastructure
packages/organization … allocation, billing, crm, delivery, projects
docs/             constitution, ADRs, epics
```
