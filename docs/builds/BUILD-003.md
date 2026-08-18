# BUILD-003 — Integration & Composition Foundation

| Field | Value |
|---|---|
| Build | BUILD-003 |
| Status | Completed — locally validated |
| Branch | `build/003-integration-composition-foundation` |
| Baseline | `43f61398a6ae42f349f198b7ea3cdbf3b988d140` (validated BUILD-002 merge) |
| Scope | Compose BUILD-001 application use cases with BUILD-002 infrastructure implementations |
| Prerequisites | BUILD-000B, BUILD-001, BUILD-002 |

## Objective

Establish the composition boundary between the application layer and concrete infrastructure implementations without introducing presentation, HTTP, persistence vendors, authentication vendors, UI, or external integrations.

## Implemented

- `@creative-lab/composition` as the explicit composition-root package.
- `createApplicationComposition()` wires `UnitOfWork`, `EventDispatcher`, and `AuthorizationService` implementations into `UseCaseExecutor`.
- `RepositoryRegistry` provides a composition-only binding point for concrete repository adapters without owning persistence behavior.
- Command and query handler registration remains outside the application package's dependency graph.
- Integration tests exercise command execution, authorization, transaction commit/rollback, and repository binding through the composition boundary.

## Architectural boundary

```text
Domain → Application ← Infrastructure
                    ↑
             Composition Root
```

The composition package may import `@creative-lab/application` and `@creative-lab/infrastructure`. Domain packages and the application package must not import `@creative-lab/composition`.

Infrastructure remains responsible for concrete technical adapters. Application remains responsible for use-case orchestration and ports. Composition is responsible only for assembling those responsibilities.

## Explicit exclusions

BUILD-003 does not introduce:

- HTTP/API routes
- Next.js or React integration
- Payload CMS integration
- PostgreSQL or ORM persistence
- external authentication providers
- external event brokers
- storage providers
- email or payment providers
- deployment infrastructure
- new business rules

## Validation

Local validation is required before this build is considered complete:

```text
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec node scripts/check-deps.mjs
pnpm exec node scripts/scaffold-check.mjs
```

## Deliberate limitation

BUILD-003 supplies the composition boundary and wiring mechanism. Concrete persistence adapters remain a later concern; the current BUILD-002 in-memory adapters remain the default implementations for integration testing.
