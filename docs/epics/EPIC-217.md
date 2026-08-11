# EPIC-217 — Contract Management

| Field               | Value                            |
| ------------------- | -------------------------------- |
| Document Title      | EPIC-217 Contract Management     |
| Document Identifier | EPIC-217                         |
| Version             | 1.0.0                            |
| Status              | Implemented (domain model)       |
| Last Updated        | 2026-08-07                       |
| Owner               | Product & Platform Engineering   |
| Approved By         | EPIC-217                         |
| Effective Date      | 2026-08-07                       |

---

## Status

**Domain model implemented** in `@creative-lab/contracts`.

## Objective

Own contractual agreements between the organization and its customers.

## Architecture

```
… → quotation → contracts
```

No upstream package may import Contracts.

## Owns

Contract, ContractVersion, ContractTerm, ContractAmendment.

## Out of scope

Project creation, invoicing, payments, production, scheduling, PDF storage,
digital signatures, email, legal workflow engines.

## Acceptance criteria

- [x] Exclusive owner of contractual lifecycle
- [x] Contract numbers unique within organization
- [x] Single current version; active versions immutable
- [x] Terms enforce ordering and mandatory constraints
- [x] Amendments generate new versions with history
- [x] Pure domain; dependency matrix intact
- [x] ≥75 unit tests
- [x] Documentation and manifest updated

## Package

`packages/contracts` → `@creative-lab/contracts`
