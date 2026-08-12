# BUILD-008 — Services & Commercial Catalogue Persistence

## Status

Implementation complete; local validation pending.

## Scope

BUILD-008 implements PostgreSQL + Drizzle persistence for EPIC-215 `@creative-lab/services` in the infrastructure layer.

Persisted aggregates:

- Service
- ServiceCategory
- PriceBook
- PriceRule

## Architecture

```text
@creative-lab/composition
        ↓
@creative-lab/infrastructure
        ↓
@creative-lab/services
```

The services domain remains independent of infrastructure, Drizzle, PostgreSQL, and persistence concerns.

## Migration

`packages/infrastructure/migrations/0004_services_persistence.sql`

Creates:

- `service_categories`
- `services`
- `price_books`
- `price_rules`

The migration preserves organization ownership, foreign-key integrity, service-code uniqueness, published price-book uniqueness per organization/currency, active price-rule uniqueness per service/price-book, and non-negative/range-valid monetary values.

## Infrastructure adapters

- `PostgresServiceRepository`
- `PostgresCategoryRepository`
- `PostgresPriceBookRepository`
- `PostgresPriceRuleRepository`

All adapters receive the existing `DrizzleDatabase` through dependency injection and do not manage PostgreSQL connections themselves.

## Mappers

`packages/infrastructure/src/persistence/services/mappers.ts` provides domain ↔ persistence mapping for all four aggregates, including branded identifiers and minor-unit monetary values.

## Composition

`registerPostgresServicesRepositories()` registers the four repository adapters in the existing composition `RepositoryRegistry`.

## Tests

Mapper round-trip coverage was added for all four aggregates. Live PostgreSQL integration remains outside this build's validation environment and scope.

## Validation

The local implementation agent must run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec node scripts/check-deps.mjs
pnpm exec node scripts/scaffold-check.mjs
```

BUILD-008 must not be considered validated until all gates pass and the working tree is clean.
