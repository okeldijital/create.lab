# BUILD-010 — Contract Persistence Foundation

## Status

**Completed — locally validated**

## Scope

BUILD-010 implements PostgreSQL + Drizzle persistence for EPIC-217 `@creative-lab/contracts` in the infrastructure layer.

Persisted aggregates:

- Contract
- ContractVersion
- ContractTerm
- ContractAmendment

## Architecture

```text
@creative-lab/composition
        ↓
@creative-lab/infrastructure
        ↓
@creative-lab/contracts
```

The contracts domain remains independent of infrastructure, Drizzle, PostgreSQL, and persistence concerns.

## Migration

`packages/infrastructure/migrations/0006_contracts_persistence.sql`

Creates:

- `contracts`
- `contract_versions`
- `contract_terms`
- `contract_amendments`

The migration preserves organization ownership, contract-number uniqueness per organization, version sequencing per contract, term ordering per version, effective/expiry integrity, and the contract/current-version circular reference through a deferred structural FK addition.

## Infrastructure adapters

- `PostgresContractRepository`
- `PostgresContractVersionRepository`
- `PostgresContractTermRepository`
- `PostgresContractAmendmentRepository`

All adapters receive the existing `DrizzleDatabase` through dependency injection and do not manage PostgreSQL connections themselves.

## Mappers

`packages/infrastructure/src/persistence/contracts/mappers.ts` provides domain ↔ persistence mapping for all four aggregates, including branded identifiers, version term IDs, lock state, mandatory terms, amendment status, and nullable resulting/current version identifiers.

## Composition

`registerPostgresContractsRepositories()` registers the four repository adapters in the existing composition `RepositoryRegistry`.

## Tests

Mapper round-trip coverage was added for all four aggregates, including version term IDs, mandatory term ordering, lock state, and amendment state.

Live PostgreSQL integration remains outside the available validation environment, consistent with the preceding persistence builds.

## Validation

Local validation gates were executed on `build/010-contracts-persistence`. See `reports/build-010-validation.md` for the measured results.
