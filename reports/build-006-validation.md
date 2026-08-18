# BUILD-006 Validation Report

## Status

**VALIDATED** (unit/static gates). PostgreSQL live integration unavailable in this environment.

| Field | Value |
| ----- | ----- |
| Branch | `build/006-crm-persistence` |
| Base | `988d4aae84c92851014d3a80f8e7ad6cfeaf7936` (BUILD-005) |
| Scope | EPIC-214 CRM PostgreSQL + Drizzle persistence |
| Date | 2026-08-12 |

## Implementation summary

- SQL migration `0002_crm_persistence.sql` for four CRM tables
- Drizzle schema under `packages/infrastructure/src/persistence/crm/`
- Mappers: Customer, Contact, Opportunity, Interaction (round-trip unit tests)
- Repository adapters for all four domain ports
- Composition binding via `registerPostgresCrmRepositories`
- Adapters inject `DrizzleDatabase` only (no independent connections)
- Interaction port remains create/read/exists only (no update/delete)

## Gates

| Gate | Result |
| ---- | ------ |
| `pnpm install --frozen-lockfile` | **PASS** |
| `pnpm typecheck` | **PASS** |
| `pnpm lint` | **PASS** |
| `pnpm test` | **PASS** — **1249** tests |
| `pnpm build` | **PASS** |
| `check-deps` | **PASS** |
| `scaffold-check` | **PASS** |
| Lockfile (`@creative-lab/crm` under infrastructure) | **PASS** |
| Architecture | **PASS** |
| PostgreSQL live integration | **Unavailable** — local PostgreSQL service not provided |

## Schema checklist

| Requirement | Result |
| ----------- | ------ |
| Tables: customers, contacts, opportunities, interactions | Yes |
| Customer organization FK | Yes |
| Contact customer FK | Yes |
| Opportunity customer FK | Yes |
| Interaction customer FK | Yes |
| Interaction optional contact FK | Yes |
| Customer number unique per organization | Yes |
| Contact email unique per customer | Yes |
| At most one primary contact per customer | Yes (partial unique index) |
| Opportunity estimatedValueMinor ≥ 0 | Yes (SQL CHECK) |
| Opportunity probability 0–100 | Yes (SQL CHECK) |
| Useful lookup indexes | Yes |
| Interaction has no update/delete | Yes (port + adapter) |
| No Project FK required for BUILD-006 | Yes (`project_id` nullable column only) |

## Local fixes applied during validation

1. Synchronized `pnpm-lock.yaml` for `infrastructure → crm`.
2. Allowed `infrastructure → crm` in `scripts/check-deps.mjs`.
3. CRM mappers: value imports for aggregates, branded-ID reconstitution, null-normalization for round-trip typing.
4. Manifest + BUILD-006 status/report updates.

## Deviations

- Drizzle schema models uniqueness/indexes; opportunity CHECK bounds exist in SQL migration only.
- Primary-contact uniqueness is a partial unique index in SQL; Drizzle models a non-partial helper index.
- Live PostgreSQL integration not executed (no local database service).

## Remaining concerns

- Run migrations 0001 + 0002 and exercise repository CRUD/transactions through `PostgresUnitOfWork.getDatabase()` against real PostgreSQL before production use.
- Adapter SQL paths are not integration-tested; coverage is mapper/schema unit tests.
