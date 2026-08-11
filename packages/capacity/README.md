# @creative-lab/capacity

> Capacity bounded context — **EPIC-203**.

Resource **planning** domain: what resources can do, how much work they can
perform, and general availability templates. Independent of scheduling and
assignment.

## Purpose

Answer:

- Can this resource perform this type of work?
- How much capacity is available?
- What is this resource capable of?
- What are normal operating limits?

Does **not** decide when work happens (Scheduling) or who is assigned
(Allocation).

## Owned aggregates

| Aggregate             | Role                                                 |
| --------------------- | ---------------------------------------------------- |
| `CapacityProfile`     | Capacity definition for a resource (Worker / Studio) |
| `Capability`          | What a resource can do (Mixing, Mastering, …)        |
| `AvailabilityProfile` | Reusable availability template (not a calendar)      |
| `WorkingPattern`      | Expected hours/days characteristics                  |
| `ResourceCapacity`    | Measurable capacity quantities                       |

## Aggregate relationships

```
Organization
    ├──* AvailabilityProfile (templates)
    ├──* WorkingPattern (templates)
    └──* CapacityProfile ──resource──► Worker | Studio (IDs only)
              ├──* Capability
              └──* ResourceCapacity
```

## Explicit non-ownership

Workers, studios, teams, schedules, calendar events, assignments, projects.

## Business rules (summary)

- One active CapacityProfile per resource with non-overlapping effective dates
- Capability names unique per profile (active)
- Availability has no calendar dates — template only
- Working pattern hours positive; days 1–7; hours/week ≤ days × hours/day
- Resource capacity quantity > 0 with unit

## Dependencies

May import: `@creative-lab/core`, `@creative-lab/organization`, `@creative-lab/workforce`.

Must not import: scheduling, allocation, infrastructure, ui.

## Public API

Import from `@creative-lab/capacity` — aggregates, value objects, enums, events,
repository ports, services, policies, factories, errors.

## Future extension points

- Equipment / vehicle / asset resource types
- Scheduling consumption of capacity profiles
- Allocation feasibility checks against ResourceCapacity

## Development

```bash
pnpm --filter @creative-lab/capacity test
pnpm --filter @creative-lab/capacity typecheck
pnpm --filter @creative-lab/capacity build
```

## Authority

- CORE-001 Domain Kernel
- EPIC-201 Organization, EPIC-202 Workforce
- EPIC-203 Capacity Management
