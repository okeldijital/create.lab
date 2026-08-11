# @creative-lab/review

> Review & Approval bounded context — **EPIC-211**.

Owns formal **review lifecycle**, **approval workflows**, **review sessions**,
and **immutable reviewer decisions**.

Does **not** own files, production, revisions, comments, delivery, or notifications.

## Owns

| Aggregate         | Role                                      |
| ----------------- | ----------------------------------------- |
| `Review`          | Formal review of a production asset       |
| `Approval`        | Approval workflow with required counts    |
| `ReviewSession`   | One review meeting (single active)        |
| `ReviewDecision`  | Immutable reviewer response               |

## Consumes (opaque IDs)

`OrganizationId`, `ProjectId`, `ProductionId`, `AssetId`

## Forbidden

File storage, binary assets, version management, messaging, scheduling,
allocation, delivery, persistence, UI, API.

## Lifecycle

### Review

```
DRAFT → IN_REVIEW → APPROVED | REJECTED → ARCHIVED
```

### Approval

```
PENDING → PARTIALLY_APPROVED → APPROVED
                            ↘ REJECTED | CANCELLED
```

Auto-completes when `completedApprovals ≥ requiredApprovals`.

### Session

```
OPEN → IN_PROGRESS → COMPLETED
```

### Decision

Immutable at create: `APPROVE` | `REJECT` | `REQUEST_CHANGES`

## Development

```bash
pnpm --filter @creative-lab/review test
pnpm --filter @creative-lab/review typecheck
pnpm --filter @creative-lab/review build
```
