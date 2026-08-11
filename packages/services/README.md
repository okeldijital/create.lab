# @creative-lab/services

> Services & Pricing bounded context — **EPIC-215**.

Answers:

- What services does the organization offer?
- How are services structured?
- What are the standard prices?
- What pricing models are available?
- Which services can be quoted?

Does **not** create quotes or invoices, calculate tax, process payments, manage
subscriptions, execute projects, or own production.

## Owns

| Aggregate         | Role                                      |
| ----------------- | ----------------------------------------- |
| `Service`         | Commercial offering + pricing model       |
| `ServiceCategory` | Logical grouping of services              |
| `PriceBook`       | Published price collection by currency    |
| `PriceRule`       | Service price range within a price book   |

## Lifecycles

### Service

```
DRAFT → ACTIVE → INACTIVE → ARCHIVED
```

### Price book

```
DRAFT → PUBLISHED → RETIRED → ARCHIVED
```

## Rules (summary)

- Service code unique per organization; immutable
- Category immutable once service is ACTIVE
- Cannot archive category while ACTIVE services reference it
- One published price book per currency per organization
- Price rules: minimum ≤ base ≤ maximum; one active rule per service per book

## Development

```bash
pnpm --filter @creative-lab/services test
pnpm --filter @creative-lab/services typecheck
pnpm --filter @creative-lab/services build
```
