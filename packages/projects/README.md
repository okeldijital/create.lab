# @creative-lab/projects

> Project Management bounded context — **EPIC-207**.

Business coordination domain: **why work exists**, how initiatives are structured,
and how progress is measured. Consumes Organization through Operations without owning them.

## Purpose

- Why is this work being performed?
- Which work belongs together?
- What objectives are being achieved?
- What phase is the project in?
- What deliverables remain?
- What dependencies exist?
- What is overall project progress?

Does **not** own tasks, work orders, sessions, allocations, bookings, workers, or outputs.
Does **not** execute work — deliverables **reference** WorkOrder IDs only.

## Owned aggregates

| Aggregate            | Role                                                   |
| -------------------- | ------------------------------------------------------ |
| `Project`            | Business initiative (root)                             |
| `ProjectPhase`       | Ordered major stages (one ACTIVE at a time)            |
| `Deliverable`        | Contractual outcomes + WorkOrder references            |
| `ProjectDependency`  | Inter-project relationships (cycle-safe)               |
| `ProjectObjective`   | Measurable goals with 0–100% progress                  |

## Lifecycle (Project)

```
CREATED → PLANNING → ACTIVE ↔ ON_HOLD → COMPLETED | CANCELLED → CLOSED
```

Closed projects are immutable.

## Phase model

- Sequence unique per project, integers ≥ 1, no gaps on create
- Ordered progression: sequence N starts only after N−1 is COMPLETED
- Exactly one ACTIVE phase at a time

## Dependency model

- Edge: `projectId` depends on `dependsOnProjectId`
- Types: `BLOCKS`, `RELATES_TO`, `OPTIONAL`
- Self-dependency prohibited; cycles rejected
- Historical rows retained (RESOLVED / CANCELLED)

## Relationship with Operations

Deliverables store `workOrderReferences` (WorkOrder IDs). Projects never mutate
Operations aggregates or duplicate execution data.

## Dependencies

`@creative-lab/core`, `organization`, `workforce`, `capacity`, `scheduling`,
`allocation`, `operations`.

## Development

```bash
pnpm --filter @creative-lab/projects test
pnpm --filter @creative-lab/projects typecheck
pnpm --filter @creative-lab/projects build
```
