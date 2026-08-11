# @creative-lab/core

> Domain Kernel — shared DDD primitives for Creative Lab (**CORE-001**).

Framework-agnostic building blocks for every bounded context. Domain packages
must not re-implement these abstractions.

## Purpose

Provide a permanent, technology-agnostic foundation for:

- Aggregate roots and entities
- Value objects
- Domain events
- Domain errors
- Identity, specifications, clock, guards, and results

## Responsibilities

| Module         | Export                                | Role                                           |
| -------------- | ------------------------------------- | ---------------------------------------------- |
| Aggregates     | `AggregateRoot<TId>`                  | Identity + domain event collection             |
| Entities       | `Entity<TId>`                         | Identity equality                              |
| Value objects  | `ValueObject<TProps>`                 | Structural equality, immutability              |
| Events         | `DomainEvent`, `DOMAIN_EVENT_VERSION` | Immutable, versioned facts                     |
| Errors         | `DomainError`                         | Shared error base (`code`)                     |
| Identity       | `Identity`                            | Strongly typed ID base (migrate IDs over time) |
| Specifications | `Specification<T>`                    | Composable `and` / `or` / `not`                |
| Clock          | `Clock`, `SystemClock`, `TestClock`   | Time abstraction                               |
| Guards         | `Guard`                               | Construction validation helpers                |
| Results        | `Result`, `Success`, `Failure`        | Optional functional results                    |
| Utils          | `generateId`, `deepEqual`             | Kernel utilities                               |

## Forbidden

- Business rules of any bounded context
- Payload / CMS / database / HTTP / UI code
- Event bus or persistence implementations

## Public API

```ts
import {
  AggregateRoot,
  Entity,
  ValueObject,
  DomainEvent,
  DOMAIN_EVENT_VERSION,
  DomainError,
  Identity,
  Specification,
  Clock,
  SystemClock,
  TestClock,
  Guard,
  Result,
  Success,
  Failure,
  generateId,
  deepEqual,
} from "@creative-lab/core";
```

## Extension guidance

1. Domain aggregates **extend** `AggregateRoot<TId>` and call `this.record(event)`.
2. Domain value objects **extend** `ValueObject<TProps>` with frozen props.
3. Domain events **extend** `DomainEvent<"Type", Payload>` and stay immutable.
4. Domain errors **extend** `DomainError` with a stable `code`.
5. Prefer `Clock` injection over `new Date()` in new domain code.
6. Concrete `Identity` subclasses (e.g. `OrganizationId`) may be introduced
   per domain; branded strings remain valid until migrated.
7. Do not copy kernel types into domain packages.

## Dependency rules

`core` has **no** internal package dependencies.

## Authority

- Platform Constitution Title II
- ADR-008, ADR-009
- CORE-001 Shared Domain Kernel Consolidation
