# @creative-lab/contracts

> Contract Management bounded context — **EPIC-217**.

Answers:

- What agreement exists?
- Which quotation does it originate from?
- What are the contractual terms?
- When does it become effective / expire?
- What amendments have been made?

Does **not** create projects, invoice, process payments, store signed PDFs,
implement digital signatures, send emails, or run legal workflow engines.

## Owns

| Aggregate            | Role                                           |
| -------------------- | ---------------------------------------------- |
| `Contract`           | Legally binding agreement lifecycle            |
| `ContractVersion`    | Sequential immutable revisions                 |
| `ContractTerm`       | Ordered clauses (mandatory protection)         |
| `ContractAmendment`  | Approved amendments create a new version       |

## Consumes (opaque IDs)

`CustomerId` (CRM), `QuoteId` (quotation), `OrganizationId`.

## Lifecycle

```
DRAFT → PENDING_SIGNATURE → ACTIVE → EXPIRED | TERMINATED → ARCHIVED
```

## Rules (summary)

- Contract number unique per organization; customer/quotation immutable
- Exactly one current version; locked after activation
- Unique term order; mandatory terms cannot be removed
- Amendments only on ACTIVE contracts; apply clones terms into new version

## Development

```bash
pnpm --filter @creative-lab/contracts test
pnpm --filter @creative-lab/contracts typecheck
pnpm --filter @creative-lab/contracts build
```
