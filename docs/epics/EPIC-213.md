# EPIC-213 — Billing & Invoicing Domain

| Field               | Value                              |
| ------------------- | ---------------------------------- |
| Document Title      | EPIC-213 Billing & Invoicing       |
| Document Identifier | EPIC-213                           |
| Version             | 1.0.0                              |
| Status              | Implemented (domain model)         |
| Last Updated        | 2026-08-07                         |
| Owner               | Product & Platform Engineering     |
| Approved By         | EPIC-213                           |
| Effective Date      | 2026-08-07                         |

---

## Status

**Domain model implemented** in `@creative-lab/billing`.

## Objective

Create a pure domain package that owns the commercial lifecycle after delivery.

Answers only: *What is owed, what has been invoiced, and what has been paid?*

## Architecture

```
… → delivery → billing
```

No upstream package may import Billing.

## Owns

- Invoices
- Invoice Lines
- Payments (business records only)
- Credit Notes

## Explicitly out of scope

Payment gateway processing, accounting, banking, tax filing, emailing invoices,
PDF generation, bookkeeping, ERP integration.

## Aggregates

| Aggregate   | Lifecycle highlights                                      |
| ----------- | --------------------------------------------------------- |
| Invoice     | DRAFT → ISSUED → PARTIALLY_PAID → PAID / VOID → ARCHIVED  |
| InvoiceLine | Immutable totals after create                             |
| Payment     | PENDING → COMPLETED → REFUNDED (or FAILED)                |
| CreditNote  | DRAFT → ISSUED → APPLIED → ARCHIVED                       |

## Money model

All monetary amounts use integer minor units via `Money` and
`InvoiceCalculationPolicy` (qty × unit − discount + taxRate rounding).

## Acceptance criteria

- [x] Billing exclusive owner of invoice state
- [x] Payments are business records only (no gateway)
- [x] Credit notes correctly reduce invoice balances
- [x] Totals calculated exclusively through domain policies
- [x] Pure domain; no infrastructure concerns
- [x] Dependency matrix intact
- [x] ≥55 unit tests
- [x] Documentation, manifest, and architecture updates

## Package

`packages/billing` → `@creative-lab/billing`
