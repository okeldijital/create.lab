# @creative-lab/engagement

> Engagement Management bounded context — **EPIC-218**.

Answers:

- What work has been formally initiated?
- Which contract authorizes the work?
- What are the contractual deliverables, milestones, and obligations?
- Is the engagement active, suspended, completed, cancelled, or archived?

This is the **contractual execution layer**—not operational execution (work
orders, scheduling, production).

## Owns

| Aggregate     | Role                                          |
| ------------- | --------------------------------------------- |
| `Engagement`  | Formal contract execution lifecycle           |
| `Deliverable` | Contractual deliverables (to acceptance)      |
| `Milestone`   | Chronological milestones (one active)         |
| `Obligation`  | Party obligations (fulfill or waive)          |

## Consumes (opaque IDs)

`ContractId`, `CustomerId`, optional `ProjectId`, `OrganizationId`.

## Lifecycle

```
DRAFT → ACTIVE ⇄ SUSPENDED → COMPLETED | CANCELLED → ARCHIVED
```

## Rules (summary)

- Engagement number unique per organization; customer/contract immutable
- Completed and archived engagements immutable (archive allowed after complete)
- Unique deliverable/milestone sequences; one active milestone
- Obligations terminal after fulfill or waive

## Development

```bash
pnpm --filter @creative-lab/engagement test
pnpm --filter @creative-lab/engagement typecheck
pnpm --filter @creative-lab/engagement build
```
