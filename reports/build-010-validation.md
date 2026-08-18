# BUILD-010 Validation Report

## Status

**VALIDATED** (unit/static gates). PostgreSQL live integration unavailable in this environment.

## Metadata

| Field | Value |
| ----- | ----- |
| BUILD | BUILD-010 — Contracts Persistence |
| Branch | `build/010-contracts-persistence` |
| Base | `origin/build/009-quotation-persistence` (`8cfb1af`) |
| HEAD (pre-finalize) | `6219405` |
| Validation date | 2026-08-12 |
| Working-tree status | Clean after finalization commit |
| Scope | EPIC-217 Contracts PostgreSQL + Drizzle persistence |

## Implementation

| Item | Detail |
| ---- | ------ |
| EPIC | EPIC-217 — Contract Management |
| Aggregates persisted | Contract, ContractVersion, ContractTerm, ContractAmendment |
| Tables | `contracts`, `contract_versions`, `contract_terms`, `contract_amendments` |
| Repository adapters | `PostgresContractRepository`, `PostgresContractVersionRepository`, `PostgresContractTermRepository`, `PostgresContractAmendmentRepository` |
| Migration | `packages/infrastructure/migrations/0006_contracts_persistence.sql` |
| Composition registration | `registerPostgresContractsRepositories()` / `CONTRACTS_REPOSITORY_KEYS` |
| Schema / mappers | `packages/infrastructure/src/persistence/contracts/` |
| Dependency direction | `@creative-lab/infrastructure` → `@creative-lab/contracts` |

### Schema notes

- Contract `current_version_id` is nullable without an inline FK in the Drizzle table definition; the migration adds `contracts_current_version_fk` after `contract_versions` exists (circular relationship pattern).
- ContractVersion stores `term_ids` as UUID array, `version_number`, `status`, and `locked`.
- ContractTerm stores `term_order`, `mandatory`, title/description.
- ContractAmendment stores optional `resulting_version_id`.

## Gates

| Gate | Result |
| ---- | ------ |
| `pnpm install --frozen-lockfile` | **PASS** |
| `pnpm typecheck` | **PASS** |
| `pnpm lint` | **PASS** |
| `pnpm test` | **PASS** — **1266** tests passed, **0** failed, **0** skipped |
| `pnpm build` | **PASS** |
| `pnpm exec node scripts/check-deps.mjs` | **PASS** |
| `pnpm exec node scripts/scaffold-check.mjs` | **PASS** |
| Lockfile (`@creative-lab/contracts` under infrastructure) | **PASS** |
| Architecture (contracts free of Drizzle/postgres/infrastructure) | **PASS** |
| PostgreSQL live integration | **UNAVAILABLE** — local PostgreSQL service not provided |

## Tests

| Metric | Count |
| ------ | ----- |
| Total | 1266 |
| Passed | 1266 |
| Failed | 0 |
| Skipped | 0 |
| Contracts persistence mapper tests | 4 (`contracts-persistence.test.ts`) |
| Infrastructure package tests | 64 |
| Contracts domain package tests | 76 |

## PostgreSQL integration

**UNAVAILABLE — local PostgreSQL service not provided**

Mapper/schema/unit tests passing does not constitute live PostgreSQL integration. No local PostgreSQL service was available (`pg_isready` unavailable; port 5432 closed).

## Local fixes applied during validation

1. Synchronized `pnpm-lock.yaml` so `packages/infrastructure` resolves `@creative-lab/contracts` and `@creative-lab/quotation` (`pnpm install --lockfile-only`).
2. Corrected mapper value imports for aggregate classes under `verbatimModuleSyntax` (same pattern as BUILD-005–008):
   - `packages/infrastructure/src/persistence/contracts/mappers.ts`
   - `packages/infrastructure/src/persistence/quotation/mappers.ts` (same defect pattern; required for monorepo typecheck/lint)
3. Schema table imports used only in `typeof` positions switched to `import type` for `@typescript-eslint/consistent-type-imports`.
4. Updated `platform.manifest.json` (`architectureVersion` → BUILD-010; BUILD-009/BUILD-010 history; infrastructure notes; infrastructure → contracts dependency edge).
5. Minimal architecture doc updates for infrastructure → contracts consistency.
6. BUILD-010 status and this validation report.

No domain semantics, application architecture, or BUILD-009 functional behavior were redesigned.

## Deviations

- Live PostgreSQL integration was not executed.
- Drizzle schema does not restate every SQL CHECK / deferred FK constraint that exists in migration SQL (consistent with prior persistence builds).

## Remaining concerns

- Apply migrations 0001–0006 and exercise Contracts CRUD/transactions through `PostgresUnitOfWork.getDatabase()` against real PostgreSQL before production use.
- Adapter SQL execution paths are unit-mapper covered only.
