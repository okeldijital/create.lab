# @creative-lab/composition

BUILD-003 Integration & Composition Foundation.

## Purpose

This package is the composition root between the BUILD-001 application layer and BUILD-002 infrastructure implementations.

## Responsibilities

- Instantiate infrastructure adapters.
- Inject infrastructure implementations into `UseCaseExecutor`.
- Register application command/query handlers.
- Bind concrete repository adapters at the outer composition boundary.

## Non-responsibilities

This package contains no domain rules, persistence implementation, HTTP transport, UI, authentication provider, or external integration logic.

## Default adapters

The default composition uses the BUILD-002 in-memory `UnitOfWork`, `EventDispatcher`, and `AuthorizationService` implementations.
