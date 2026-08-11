# @creative-lab/quotation

> Quotation Management bounded context — **EPIC-216**.

Answers:

- What has been offered to the customer?
- Which services are included?
- What pricing was offered?
- What version of the quote is current?
- Has the customer accepted, rejected, or allowed the quote to expire?

Does **not** create projects, generate invoices, reserve resources, allocate
staff, execute production, send emails, produce PDFs, calculate taxes, or
process payments.

## Owns

| Aggregate       | Role                                              |
| --------------- | ------------------------------------------------- |
| `Quote`         | Commercial proposal lifecycle                     |
| `QuoteVersion`  | Immutable revision with sequential versioning     |
| `QuoteLine`     | Service line (qty × unit price via PricingPolicy) |
| `QuoteApproval` | Customer accept/decline decision                  |

## Consumes (opaque IDs)

`CustomerId`, optional `OpportunityId` (CRM); `ServiceId` (services);
`OrganizationId`.

## Lifecycle

```
DRAFT → ISSUED → ACCEPTED | DECLINED | EXPIRED → ARCHIVED
```

## Rules (summary)

- Quote number unique per organization; immutable with customer/currency
- Exactly one current version; issued versions locked
- Lines reference services only; pricing via `PricingPolicy`
- Approvals terminal and immutable after decision

## Development

```bash
pnpm --filter @creative-lab/quotation test
pnpm --filter @creative-lab/quotation typecheck
pnpm --filter @creative-lab/quotation build
```
