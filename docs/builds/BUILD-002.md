# BUILD-002 — Infrastructure Foundation

| Field | Value |
|---|---|
| Build | BUILD-002 |
| Status | Implementation in progress — local validation required |
| Branch | `build/002-infrastructure-foundation` |
| Scope | Infrastructure adapters for application ports |
| Prerequisites | BUILD-000B, BUILD-001 |

## Objective

Provide the first concrete infrastructure implementations behind the BUILD-001 application ports without moving persistence, transport, authentication, or technical concerns into domain packages.

## Implemented

- `InMemoryUnitOfWork` for transaction lifecycle testing.
- `InMemoryEventDispatcher` for in-process event publication and subscription.
- `InMemoryAuthorizationService` with organization-scoped, deny-by-default membership permissions.
- `InMemoryRepository` as an organization-isolated persistence adapter foundation.
- Infrastructure configuration boundary with explicit in-memory adapter selection.
- Infrastructure-specific error types.

## Architectural constraints

- Domain packages remain infrastructure-agnostic.
- Application contracts remain ports/interfaces.
- No database, ORM, Payload, HTTP, UI, authentication vendor, or external event broker is introduced by BUILD-002.
- Concrete adapters live under `packages/infrastructure`.
- Event payloads are not mutated by the dispatcher.
- Authorization denies missing organization or membership context.

## Validation status

The implementation includes infrastructure unit tests. Full monorepo typecheck, lint, test, build, dependency, and scaffold validation must be executed in the local development environment before this build is considered complete.

## Deliberate limitation

The repository implementation is intentionally generic and in-memory at this stage. Concrete database adapters and vendor integrations belong to later infrastructure work after their persistence/authentication decisions are explicitly established.
