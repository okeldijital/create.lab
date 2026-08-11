# @creative-lab/billing

> Billing & Invoicing bounded context — **EPIC-213**.

Answers only: **"What is owed, what has been invoiced, and what has been paid?"**

Does **not** own payment processing, banking, tax filing, PDF generation, email,
bookkeeping, or ERP integration.

## Owns

| Aggregate     | Role                                              |
| ------------- | ------------------------------------------------- |
| `Invoice`     | Legal billing document + balance                  |
| `InvoiceLine` | Commercial line (qty × price − discount + tax)    |
| `Payment`     | Business payment record (not a gateway txn)       |
| `CreditNote`  | Invoice reduction                                 |

## Consumes (opaque IDs)

`ProjectId`, `DeliveryId`, `OrganizationId`, plus free-form `customerId`.

## Lifecycle

### Invoice

```
DRAFT → ISSUED → PARTIALLY_PAID → PAID → ARCHIVED
              ↘ VOID → ARCHIVED
```

### Payment

```
PENDING → COMPLETED → REFUNDED
       ↘ FAILED
```

### Credit note

```
DRAFT → ISSUED → APPLIED → ARCHIVED
```

## Rules (summary)

- Invoice number, currency, project, delivery immutable
- Lines only while DRAFT; totals via `InvoiceCalculationPolicy`
- Payments cannot exceed outstanding balance
- Paid invoices cannot be voided
- Credit notes cannot exceed invoice total / balance; apply once
- Money uses integer minor units (`Money` value object)

## Development

```bash
pnpm --filter @creative-lab/billing test
pnpm --filter @creative-lab/billing typecheck
pnpm --filter @creative-lab/billing build
```
