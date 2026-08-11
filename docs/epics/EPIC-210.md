# EPIC-210 — Asset Management

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | EPIC-210 Asset Management      |
| Document Identifier | EPIC-210                       |
| Version             | 1.0.0                          |
| Status              | Implemented (domain model)     |
| Last Updated        | 2026-08-07                     |
| Supersedes          | BUILD-000 assets scaffold      |
| Owner               | Product & Platform Engineering |
| Approved By         | EPIC-210                       |
| Effective Date      | 2026-08-07                     |

---

## Status

**Domain model implemented** in `@creative-lab/assets`.

## Objectives

- Model creative asset identity, classification, and lifecycle
- Immutable sequential versions with checksum/metadata only
- Collections and directed relationships
- Zero storage coupling

## Architecture

```
… → production → assets
```

Assets consume opaque ProjectId / ProductionId only. Physical storage remains
Infrastructure. No upstream package imports Assets.

## Aggregate model

Asset, AssetVersion, AssetCollection, AssetRelationship.

## Lifecycle

- Asset: ACTIVE ↔ ARCHIVED (restore requires current version)
- Version: created CURRENT or SUPERSEDED; promote supersedes previous
- Collection: active until archived (immutable after)
- Relationship: create → soft remove

## Dependency rationale

Assets are produced by production work and organized under projects. Placing
Assets after Production preserves planning/execution ownership while allowing
asset identity to reference those contexts without reverse coupling.

## Acceptance criteria

- [x] Four aggregates; no binary/path storage
- [x] Sequential immutable versions; one current
- [x] Unique collection names; relationship self/dupe bans
- [x] Ports only; policies; versioned events
- [x] ≥50 unit tests
- [x] Docs + domain map + platform manifest
- [x] Dependency matrix compliance
