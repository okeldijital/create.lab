# @creative-lab/delivery

> Delivery Management bounded context — **EPIC-212**.

Answers only: **"Has the approved work officially been delivered?"**

Does **not** own storage, file transfer, downloads, invoices, or notifications.

## Owns

| Aggregate          | Role                                              |
| ------------------ | ------------------------------------------------- |
| `Delivery`         | Official delivery state + reference number        |
| `DeliveryPackage`  | Logical package (OPEN → SEALED → ARCHIVED)        |
| `DeliveryItem`     | Asset + version **reference** only                |
| `DeliveryReceipt`  | Recipient acknowledgement                         |

## Consumes (opaque IDs)

`ProjectId`, `ProductionId`, `ReviewId`, `AssetId`, `AssetVersionId`, `OrganizationId`

## Lifecycle

```
DRAFT → READY → DELIVERED → CONFIRMED → ARCHIVED
```

## Rules (summary)

- Project / production / review immutable on Delivery
- Cannot deliver twice; cannot confirm before deliver
- Sealed packages immutable; must have ≥1 item to seal
- Items: no URL/path/blob
- One receipt per recipient; immutable after confirm/reject

## Development

```bash
pnpm --filter @creative-lab/delivery test
pnpm --filter @creative-lab/delivery typecheck
pnpm --filter @creative-lab/delivery build
```
