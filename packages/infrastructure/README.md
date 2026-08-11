# @creative-lab/infrastructure

> Platform infrastructure package — scaffolding only (BUILD-000A).

## Purpose

`infrastructure` provides all platform-level technical capabilities that are
not business-domain concerns. It keeps `@creative-lab/core` framework-agnostic
by owning concrete adapters and technical integrations.

## Responsibilities

Owns (when implemented in future builds):

- Payload CMS integration
- Environment and configuration loading
- Logging
- Storage, email, queue, cache, and search providers
- External API clients
- Authentication providers (technical adapters)
- File and object storage
- Event bus and scheduler implementations
- Infrastructure adapters

**Never contains business rules.**

## Structure

```
packages/infrastructure/
├── src/
│   ├── config/
│   ├── logging/
│   ├── storage/
│   ├── email/
│   ├── queue/
│   ├── cache/
│   ├── search/
│   ├── payload/
│   ├── auth/
│   ├── integrations/
│   ├── scheduler/
│   ├── events/
│   ├── adapters/
│   ├── utils/
│   └── index.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Dependency rules

May import: `@creative-lab/core`, `@creative-lab/config`.

Must not import domain packages (`organization`, `workforce`, etc.) or `@creative-lab/ui`.

See [package-dependencies](../../docs/standards/package-dependencies.md).

## Authority

- Platform Constitution Title II
- ADR-008 Package Boundaries
- Package Classification: Infrastructure
- BUILD-000A-01

## Development

```bash
pnpm --filter @creative-lab/infrastructure build
pnpm --filter @creative-lab/infrastructure typecheck
pnpm --filter @creative-lab/infrastructure test
pnpm --filter @creative-lab/infrastructure lint
```
