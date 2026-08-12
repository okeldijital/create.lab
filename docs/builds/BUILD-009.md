# BUILD-009 — Quotation Persistence

## Status

**Implementation complete on the BUILD-009 branch; local validation pending.**

## Scope

BUILD-009 implements PostgreSQL + Drizzle persistence for EPIC-216 `@creative-lab/quotation` in the infrastructure layer.

Persisted aggregates:

- Quote
- QuoteVersion
- QuoteLine
- QuoteApproval

## Architecture

```text
@creative-lab/composition
        ↓
@creative-lab/infrastructure
        ↓
@creative-lab/quotation
```

The quotation domain remains independent of infrastructure, Drizzle, PostgreSQL, and persistence concerns.

## Migration

`packages/infrastructure/migrations/0005_quotation_persistence.sql`

Creates:

- `quotes`
- `quote_versions`
- `quote_lines`
- `quote_approvals`

The migration preserves organization ownership, quote-number uniqueness per organization, version sequencing per quote, one CURRENT version per quote, current-version referential integrity, service/customer/opportunity references, positive quantities, and non-negative monetary values.

## Infrastructure adapters

- `PostgresQuoteRepository`
- `PostgresQuoteVersionRepository`
- `PostgresQuoteLineRepository`
- `PostgresQuoteApprovalRepository`

All adapters receive the existing `DrizzleDatabase` through dependency injection and do not manage PostgreSQL connections themselves.

## Mappers

`packages/infrastructure/src/persistence/quotation/mappers.ts` provides domain ↔ persistence mapping for all four aggregates, including branded identifiers, monetary minor units, dates, approval state, and decimal quantities.

## Composition

`registerPostgresQuotationRepositories()` registers the four repository adapters in the existing composition `RepositoryRegistry`.

## Tests

Mapper round-trip coverage was added for all four aggregates, including decimal quantity and monetary preservation.

Live PostgreSQL integration remains outside the available validation environment, consistent with BUILD-005 through BUILD-008.

## Validation

The local validation gates must be executed from the BUILD-009 branch before the build is marked validated. See `reports/build-009-validation.md` for the validation record.
