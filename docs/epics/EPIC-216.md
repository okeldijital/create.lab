# EPIC-216 — Quotation Management

| Field               | Value                              |
| ------------------- | ---------------------------------- |
| Document Title      | EPIC-216 Quotation Management      |
| Document Identifier | EPIC-216                           |
| Version             | 1.0.0                              |
| Status              | Implemented (domain model)         |
| Last Updated        | 2026-08-07                         |
| Owner               | Product & Platform Engineering     |
| Approved By         | EPIC-216                           |
| Effective Date      | 2026-08-07                         |

---

## Status

**Domain model implemented** in `@creative-lab/quotation`.

## Objective

Own the complete quotation lifecycle: offer, versioning, lines, and customer
response.

## Architecture

```
… → services → quotation
```

Downstream of CRM and Services. Projects may later reference accepted quotes by
opaque ID only.

## Owns

Quote, QuoteVersion, QuoteLine, QuoteApproval.

## Out of scope

Project creation, invoicing, tax, payments, resource allocation, production,
PDF/email.

## Acceptance criteria

- [x] Exclusive owner of quotation lifecycle
- [x] Quote numbers unique within organization
- [x] Single current version; issued versions immutable
- [x] Lines reference services; pricing via policies
- [x] Approvals terminal and immutable
- [x] Pure domain; dependency matrix intact
- [x] ≥70 unit tests
- [x] Documentation and manifest updated

## Package

`packages/quotation` → `@creative-lab/quotation`
