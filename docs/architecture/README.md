# Architecture

| Field               | Value                 |
| ------------------- | --------------------- |
| Document Title      | Architecture Index    |
| Document Identifier | ARCH-INDEX            |
| Version             | EPIC-201              |
| Status              | Accepted              |
| Last Updated        | 2026-08-06            |
| Supersedes          | BUILD-000A            |
| Owner               | Platform Architecture |
| Approved By         | EPIC-201              |
| Effective Date      | 2026-08-06            |

---

Architecture narrative and registries for the Creative Lab platform.

## Authority order

1. [Platform Constitution](../constitution/Platform-Constitution.md)
2. [Architecture Decision Records](../adr/)
3. Epic Specifications
4. [Engineering Standards](../standards/)
5. Implementation

## Architecture documents

| Document                      | Path                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------- |
| Domain map (bounded contexts) | [domain-map.md](./domain-map.md)                                             |
| Package classification        | [package-classification.md](./package-classification.md)                     |
| Package dependency matrix     | [../standards/package-dependencies.md](../standards/package-dependencies.md) |
| Platform layers standard      | [../standards/Platform-Layers.md](../standards/Platform-Layers.md)           |
| Platform manifest             | [../../platform.manifest.json](../../platform.manifest.json)                 |

## Domain hierarchy

```
Organization
    ↓
Workforce
    ↓
Capacity
    ↓
Scheduling
    ↓
Allocation
    ↓
Operations
```

## Dependency graph (domain chain)

```
@creative-lab/organization
        │
        ▼
@creative-lab/workforce
        │
        ▼
@creative-lab/capacity
        │
        ▼
@creative-lab/scheduling
        │
        ▼
@creative-lab/allocation
```

Platform packages:

```
config  (no internal deps)
core    (no internal deps)
  ├── infrastructure  (→ core, config)
  └── ui              (→ core, config)

Domain packages may import core, infrastructure, config
and their upstream domain packages only.
```

Satellite packages (`collaboration`, `assets`) may depend on `core` and
`organization` only.

Enforcement: `scripts/check-deps.mjs` (ADR-008,
[package-dependencies](../standards/package-dependencies.md)).

## Domain Kernel

`@creative-lab/core` (CORE-001) is the authoritative source for DDD primitives
shared by all bounded contexts. See [core README](../../packages/core/README.md).

## Implementation status

| Context       | Package                      | Status                              |
| ------------- | ---------------------------- | ----------------------------------- |
| Domain Kernel | `@creative-lab/core`         | Kernel primitives (CORE-001)        |
| Organization  | `@creative-lab/organization` | Domain model implemented (EPIC-201) |
| Workforce     | `@creative-lab/workforce`    | Domain model implemented (EPIC-202) |
| Capacity      | `@creative-lab/capacity`     | Domain model implemented (EPIC-203) |
| Scheduling    | `@creative-lab/scheduling`   | Domain model implemented (EPIC-204) |
| Allocation    | `@creative-lab/allocation`   | Domain model implemented (EPIC-205) |
| Operations    | _(no package yet)_           | Registry only                       |

## Related

- [ADR Index](../adr/README.md)
- [Folder Structure Standard](../standards/Folder-Structure.md)
- [EPIC-201](../epics/EPIC-201.md)
- [EPIC-202](../epics/EPIC-202.md)
- [EPIC-203](../epics/EPIC-203.md)
- [EPIC-204](../epics/EPIC-204.md)
- [EPIC-205](../epics/EPIC-205.md)
- [Organization package README](../../packages/organization/README.md)
- [Workforce package README](../../packages/workforce/README.md)
- [Capacity package README](../../packages/capacity/README.md)
- [Scheduling package README](../../packages/scheduling/README.md)
- [Allocation package README](../../packages/allocation/README.md)
