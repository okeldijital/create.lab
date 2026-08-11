# EPIC-214 — Customer Relationship Management (CRM)

| Field               | Value                                          |
| ------------------- | ---------------------------------------------- |
| Document Title      | EPIC-214 Customer Relationship Management      |
| Document Identifier | EPIC-214                                       |
| Version             | 1.0.0                                          |
| Status              | Implemented (domain model)                     |
| Last Updated        | 2026-08-07                                     |
| Owner               | Product & Platform Engineering                 |
| Approved By         | EPIC-214                                       |
| Effective Date      | 2026-08-07                                     |

---

## Status

**Domain model implemented** in `@creative-lab/crm`.

## Objective

Own the lifecycle of business relationships before, during, and after projects.

## Architecture

```
… → billing → crm
```

No upstream package may import CRM.

## Owns

Customer, Contact, Opportunity, Interaction.

## Out of scope

Invoicing, project execution, production, email sending, external CRM sync,
marketing campaigns, document storage, authentication.

## Acceptance criteria

- [x] CRM exclusive owner of customer/contact/opportunity/interaction lifecycles
- [x] Customer numbers unique within organization
- [x] One primary contact per customer
- [x] Opportunity progression via domain policies
- [x] Interactions immutable after creation
- [x] Pure domain; dependency matrix intact
- [x] ≥60 unit tests
- [x] Documentation and manifest updated

## Package

`packages/crm` → `@creative-lab/crm`
