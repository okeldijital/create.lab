# @creative-lab/production

> Production Management bounded context — **EPIC-209**.

Owns the **lifecycle of creative production** from initiation through completion:
progress, sessions, milestones, revisions, and completion.

Does **not** own projects, work orders, scheduling, allocations, assets, or finance.

## Responsibility

Track production execution state only.

## Owns

| Aggregate              | Role                                      |
| ---------------------- | ----------------------------------------- |
| `Production`           | Active production effort (root)           |
| `ProductionSession`    | Individual working session                |
| `ProductionMilestone`  | Ordered checkpoints                       |
| `Revision`             | Sequential revision requests              |

## Consumes (opaque references)

- `ProjectId` (Projects)
- `WorkOrderId` (Operations)
- Organization tenancy
- Optional: Allocation / Owner identities as opaque strings

Never mutates upstream domains.

## Forbidden

- Scheduling, capacity math, resource allocation
- Asset/file storage
- Projects/work-order ownership
- Persistence, UI, API, Payload CMS

## Lifecycle

### Production

```
CREATED → PLANNING → ACTIVE ↔ ON_HOLD → COMPLETED → ARCHIVED
```

Completed and archived are immutable (archive allowed after complete).

### Session

```
OPEN → PAUSED → RESUMED → COMPLETED
```

Only one open session per production. End after start; positive duration.

### Milestone

Sequence unique, no gaps, one ACTIVE, ordered activation after prior COMPLETED.

### Revision

```
REQUESTED → IN_PROGRESS → COMPLETED → CLOSED
```

Sequential revision numbers.

## Events

ProductionCreated/Started/Paused/Resumed/Completed/Archived,
SessionOpened/Paused/Resumed/Completed,
MilestoneCreated/Activated/Completed,
RevisionRequested/Started/Completed/Closed.

## Example

```ts
const production = await productionService.create({
  organizationId,
  projectId,
  workOrderId,
  name: "Album Mix",
  ownerId: "producer-1",
});
await productionService.start(production.id);

const session = await sessionService.open({
  organizationId,
  productionId: production.id,
});
await sessionService.complete(session.id);
```

## Development

```bash
pnpm --filter @creative-lab/production test
pnpm --filter @creative-lab/production typecheck
pnpm --filter @creative-lab/production build
```
