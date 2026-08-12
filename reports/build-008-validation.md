# BUILD-008 Validation Report

## Status

**VALIDATED** (unit/static gates). PostgreSQL live integration unavailable in this environment.

| Field | Value |
| ----- | ----- |
| Branch | `build/008-services-persistence` |
| Base | `4f64ba868e30f682294d4a1ba6a2782c7cafdc0d` (BUILD-007) |
| Scope | EPIC-215 Services PostgreSQL + Drizzle persistence |
| Date | 2026-08-12 |

## Implementation summary

- SQL migration `0004_services_persistence.sql` for four Services tables
- Drizzle schema under `packages/infrastructure/src/persistence/services/`
- Mappers: Service, ServiceCategory, PriceBook, PriceRule (round-trip unit tests)
- Repository adapters for all four domain ports (DI via `DrizzleDatabase`)
- Composition: `registerPostgresServicesRepositories` registers service, category, priceBook, priceRule

## Gates

| Gate | Result |
| ---- | ------ |
| `pnpm install --frozen-lockfile` | **PASS** |
| `pnpm typecheck` | **PASS** |
| `pnpm lint` | **PASS** |
| `pnpm test` | **PASS** — **1258** tests |
| `pnpm build` | **PASS** |
| `check-deps` | **PASS** |
| `scaffold-check` | **PASS** |
| Lockfile (`@creative-lab/services` under infrastructure) | **PASS** |
| Architecture | **PASS** |
| PostgreSQL live integration | **UNAVAILABLE** — local PostgreSQL service not provided |

## Schema checklist

| Requirement | Result |
| ----------- | ------ |
| Tables: service_categories, services, price_books, price_rules | Yes |
| Organization ownership FKs | Yes |
| Service code unique per organization | Yes |
| Published price-book unique per organization/currency | Yes (partial unique index) |
| Active price-rule unique per service/price-book | Yes (partial unique index) |
| Non-negative monetary values | Yes (SQL CHECK) |
| minimum ≤ base ≤ maximum | Yes (SQL CHECK) |
| Required foreign keys (category, price book, service) | Yes |

## Local fixes applied during validation

1. Synchronized `pnpm-lock.yaml` for `infrastructure → services`.
2. Manifest + BUILD-008 status/report updates.

No TypeScript, lint, test, or adapter defects required code changes beyond lockfile/docs/manifest finalization.

## Deviations

- Partial unique indexes for published price books and active price rules exist in SQL; Drizzle schema models base tables/indexes without partial-index predicates.
- Live PostgreSQL integration not executed.

## Remaining concerns

- Apply migrations 0001–0004 and exercise Services CRUD/transactions through `PostgresUnitOfWork.getDatabase()` against real PostgreSQL before production use.
- Adapter SQL paths are unit-mapper covered only.
