# @creative-lab/application

> Application Layer Foundation — **BUILD-001**.

Orchestrates domain packages into use cases. **No business rules.**

## Layering

```text
Presentation (API / Web / CLI)
        ↓
   Application   ← this package
        ↓
     Domain
        ↓
 Infrastructure
```

The Application Layer is the **only** layer permitted to coordinate multiple
domain packages.

## Owns

| Concern | Location |
| ------- | -------- |
| Commands / Queries | `src/commands`, `src/queries` |
| Handlers / Use cases | `src/handlers` |
| DTOs / Mappers | `src/dto`, `src/mappers` |
| Authorization port | `src/authorization` |
| Unit of Work port | `src/transactions` |
| Event dispatch port | `src/events` |
| Validators | `src/validators` |
| Application errors | `src/errors` |
| Orchestration services | `src/services` |

## Does not own

- Domain business rules (aggregates, policies)
- Persistence implementations
- HTTP / UI / Payload collections
- RBAC implementations (interface only)

## Example flow

```text
Command → Validator → Authorization → UnitOfWork.begin
       → Handler (domain service / repository ports)
       → Collect domain events → EventDispatcher
       → UnitOfWork.commit → DTO response
```

## Development

```bash
pnpm --filter @creative-lab/application test
pnpm --filter @creative-lab/application typecheck
pnpm --filter @creative-lab/application build
```
