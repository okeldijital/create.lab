# BUILD-002 — Infrastructure Foundation

| Field | Value |
|---|---|
| Build | BUILD-002 |
| Status | Completed — validated through cumulative BUILD-003–016 gate |
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
- PostgreSQL + Drizzle infrastructure introduced and expanded by BUILD-003–016.

## Architectural constraints

- Domain packages remain infrastructure-agnostic.
- Application contracts remain ports/interfaces.
- Concrete adapters live under `packages/infrastructure`.
- Event payloads are not mutated by the dispatcher.
- Authorization denies missing organization or membership context.
- Database persistence remains an infrastructure concern and is not imported by domain packages.

## Validation status

BUILD-002 is considered complete as a foundation. The cumulative BUILD-016 validation gate recorded 1,295/1,295 tests passing with install, typecheck, lint, build, dependency, and scaffold checks passing on the cumulative implementation branch.

Live PostgreSQL integration was not available in the validation environment and remains an explicit integration-readiness item rather than a claimed passing gate.

## Deliberate limitation

Concrete database adapters are implemented for the current domain persistence vertical slices, while authentication, external event brokers, transport, and vendor integrations remain outside the infrastructure scope until explicitly introduced by later builds.
