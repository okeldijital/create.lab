# Creative Lab

**creative-lab** is the multi-tenant operations platform for create.lab.
M² Lab is the flagship tenant. GitHub is the implementation authority.

This is not an MVP yet. The first workspace slice is on
`mvp/auth-002-project-list` at `ae8174f`. It is not merged, and it is not
what `create.okeldijital.africa` serves. Production is still `main` at
`0f88b26`.

## Current product path

Verified on Vercel previews of this branch, through 2026-10-05:

1. Sign up and sign in with Better Auth email and password.
2. A session resolves the actor. No identity header is trusted.
3. The first sign-in creates a personal organization and owner membership when none exists.
4. `/projects` lists that organization's projects and can submit a create.
5. Authorization stays in the application executor. `project.read` and `project.create` are enforced.

Missing session fails closed. A signed-in user without a workspace is no longer shown the same screen as a signed-out user.

## Verified and fixed on this branch

- Auth route no longer opens Postgres while Next collects page data.
- `pnpm-lock.yaml` includes `better-auth`.
- Drizzle receives the auth schema. Field names are not mapped a second time.
- Preview hosts are trusted in addition to `BETTER_AUTH_URL`.
- Auth tables are created if missing. `account.issuer` is optional for credential accounts.
- A signup that saved the user but not the password can be retried.
- Project create no longer crashes in the reserved-connection transaction.

## What is not done

- AUTH-002 and this branch are not merged. [PR #13](https://github.com/okeldijital/create.lab/pull/13) does not contain this branch.
- A created project has not yet been opened on `ae8174f`. The previous preview died before the insert.
- The shell still shows Sign in after a session.
- No client intake, deposit gate, or delivery flow.
- `@creative-lab/ui` and `apps/cms` are scaffolds.
- GitHub Actions is not a usable gate on the free plan. Verify with a local `pnpm` check or the Vercel preview. New environment variables require a new deployment.

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

Preview needs `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`.
Set them before the deployment that should use them.

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
