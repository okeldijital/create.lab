# BUILD-001 — Application Layer Foundation

| Field               | Value                                      |
| ------------------- | ------------------------------------------ |
| Document Title      | BUILD-001 Application Layer Foundation     |
| Document Identifier | BUILD-001                                  |
| Version             | 1.0.0                                      |
| Status              | Implemented                                |
| Last Updated        | 2026-08-07                                 |
| Prerequisites       | BUILD-000A, BUILD-000B, EPIC-201–220       |
| Package             | `packages/application`                     |

---

## Objective

Construct the Application Layer that orchestrates domain packages without
introducing business logic.

## Package

`@creative-lab/application`

## Responsibilities

- Use cases (commands, queries, handlers)
- DTO mapping (domain → presentation boundary)
- Authorization, Unit of Work, Event Dispatcher **ports**
- Validation pipelines (structural)
- Cross-domain orchestration (e.g. Quotation → Contract → Engagement)

## Non-responsibilities

Business rules remain exclusively in domain packages.

## Architecture

```text
Presentation → Application → Domain → Infrastructure
```

Application may import all domain packages, `core`, and (matrix-allowed)
`infrastructure` / `config`. It must not import web/react/next/payload models
or reverse-depend from domain packages.

## Key types

| Type | Role |
| ---- | ---- |
| `Command` / `Query` | Input markers (data only) |
| `CommandHandler` / `QueryHandler` | Use-case execution |
| `UseCaseExecutor` | Auth + UoW + handler + events |
| `UnitOfWork` | Transaction boundary (interface) |
| `EventDispatcher` | Integration event publish (interface) |
| `AuthorizationService` | Permission boundary (interface) |
| `ApplicationError` | Layer-specific errors (≠ DomainError) |
| `*Mapper` | Aggregate → DTO |

## Acceptance

- [x] Package structure complete
- [x] Commands, queries, handlers, DTOs, mappers, validators
- [x] Ports only for auth, UoW, events
- [x] No duplicated domain rules
- [x] No infrastructure/UI/persistence implementations
- [x] Dependency matrix valid
- [x] Docs + manifest updated
- [x] ≥120 unit tests
- [x] lint / typecheck / build / test / check-deps / scaffold-check pass

## Validation report

See `reports/build-001-validation.md` (produced with gate run).
