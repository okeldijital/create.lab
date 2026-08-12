# Integration & Composition Boundary

**Document:** ARCH-INT-COMP  
**Version:** BUILD-003  
**Status:** Accepted for BUILD-003 implementation  

## Purpose

The composition boundary is the only location responsible for assembling application ports with concrete infrastructure implementations.

## Dependency direction

```text
Business Domain
      ↓
Application Layer
      ↑
Infrastructure
      ↑
Composition Root
```

The arrows above describe dependency permission rather than runtime call direction:

- Domain remains independent of application, infrastructure, and composition.
- Application defines ports and consumes domain APIs.
- Infrastructure implements application ports.
- Composition imports application and infrastructure and wires them together.
- Presentation layers consume the composed application runtime later.

## Composition responsibilities

1. Instantiate infrastructure implementations.
2. Instantiate the application `UseCaseExecutor` with those implementations.
3. Register command and query handlers at the composition boundary.
4. Bind concrete repository adapters without implementing repository behavior in composition.
5. Expose one runtime object suitable for presentation or other outer-layer entry points.

## Prohibited responsibilities

Composition must not contain:

- domain business rules
- persistence implementation
- HTTP transport
- UI code
- authentication-provider logic
- external service integrations
- framework-specific request handling

## Current implementation

`@creative-lab/composition` provides:

- `createApplicationComposition()`
- `registerCommandHandler()`
- `registerQueryHandler()`
- `executeCommand()`
- `RepositoryRegistry`

The default runtime uses BUILD-002's in-memory `UnitOfWork`, `EventDispatcher`, and `AuthorizationService` implementations.

## Future integration

Later persistence and vendor adapters replace or supplement the concrete infrastructure bindings without changing domain contracts or the application's use-case boundary.
