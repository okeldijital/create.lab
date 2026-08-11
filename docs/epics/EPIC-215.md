# EPIC-215 — Services & Pricing Domain

| Field               | Value                                    |
| ------------------- | ---------------------------------------- |
| Document Title      | EPIC-215 Services & Pricing Domain       |
| Document Identifier | EPIC-215                                 |
| Version             | 1.0.0                                    |
| Status              | Implemented (domain model)               |
| Last Updated        | 2026-08-07                               |
| Owner               | Product & Platform Engineering           |
| Approved By         | EPIC-215                                 |
| Effective Date      | 2026-08-07                               |

---

## Status

**Domain model implemented** in `@creative-lab/services`.

## Objective

Own the organization's commercial service catalogue and standard pricing rules.

## Architecture

```
… → crm → services
```

No upstream package may import Services.

## Owns

Service, ServiceCategory, PriceBook, PriceRule.

## Out of scope

Quotes, invoices, tax calculation, payments, subscriptions, project execution,
production, non-standard discount engines.

## Acceptance criteria

- [x] Exclusive owner of commercial service catalogue
- [x] Service codes unique within organization
- [x] Categories protected while active services reference them
- [x] Price books control published pricing by currency
- [x] Price rules enforce ranges and uniqueness
- [x] Pure domain; dependency matrix intact
- [x] ≥65 unit tests
- [x] Documentation and manifest updated

## Package

`packages/services` → `@creative-lab/services`
