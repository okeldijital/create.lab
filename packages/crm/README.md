# @creative-lab/crm

> Customer Relationship Management bounded context — **EPIC-214**.

Answers:

- Who is the customer?
- Who are the contacts?
- What opportunities exist?
- What communications have occurred?
- What is the current relationship status?

Does **not** invoice, execute projects, send email, sync external CRMs, run
marketing campaigns, store documents, or authenticate users.

## Owns

| Aggregate      | Role                                         |
| -------------- | -------------------------------------------- |
| `Customer`     | Business customer lifecycle                  |
| `Contact`      | Individuals on a customer (one primary)      |
| `Opportunity`  | Potential work pipeline                      |
| `Interaction`  | Immutable communication history              |

## Consumes (opaque IDs)

`OrganizationId`, optional `ProjectId` on opportunities. Billing references
customers by opaque customer number / id only (no invoice ownership).

## Lifecycles

### Customer

```
LEAD → PROSPECT → ACTIVE → INACTIVE → ARCHIVED
                    ↗ restore
```

### Opportunity

```
OPEN → QUALIFIED → PROPOSAL → NEGOTIATION → WON | LOST → ARCHIVED
```

## Rules (summary)

- Customer number unique per organization; immutable
- One primary contact per customer; email unique within customer
- Opportunity probability 0–100; value ≥ 0
- Interactions immutable after create

## Development

```bash
pnpm --filter @creative-lab/crm test
pnpm --filter @creative-lab/crm typecheck
pnpm --filter @creative-lab/crm build
```
