# Platform Layers & Architecture Governance

| Field               | Value                                     |
| ------------------- | ----------------------------------------- |
| Document Title      | Platform Layers & Architecture Governance |
| Document Identifier | STD-PLATFORM-LAYERS                       |
| Version             | BUILD-000A                                |
| Status              | Accepted                                  |
| Last Updated        | 2026-08-06                                |
| Supersedes          | None                                      |
| Owner               | Platform Engineering                      |
| Approved By         | BUILD-000A                                |
| Effective Date      | 2026-08-06                                |

---

## Purpose

Engineering standard covering platform layers introduced or formalized under
BUILD-000A, and the governance artifacts that keep them coherent.

## Package classification

Every package has exactly one primary classification. See
[package-classification.md](../architecture/package-classification.md).

| Classification         | Packages                                                                        |
| ---------------------- | ------------------------------------------------------------------------------- |
| Domain Kernel          | `core`                                                                          |
| Infrastructure         | `infrastructure`                                                                |
| Platform Configuration | `config`                                                                        |
| Presentation Library   | `ui`                                                                            |
| Business Domain        | `organization`, `workforce`, `capacity`, `scheduling`, `allocation`, satellites |
| Test Support           | `test-utils`                                                                    |

## Dependency matrix

The formal allowed-import matrix is
[package-dependencies.md](./package-dependencies.md).

Enforcement: `pnpm run lint:deps` → `scripts/check-deps.mjs`.

## Platform manifest

`platform.manifest.json` at the repository root is the single source of truth
describing platform composition: versions, packages, applications, epics, ADRs,
and the dependency matrix snapshot.

Rules:

1. Manifest must match the repository after structural changes.
2. Do not invent future versions; use versions present in the repo.
3. Update `lastUpdated` when the manifest changes.

## Infrastructure layer

`@creative-lab/infrastructure` owns platform technical capabilities. `core`
remains framework-agnostic. Business rules never live in infrastructure.

Structure: `packages/infrastructure/src/{config,logging,storage,email,queue,cache,search,payload,auth,integrations,scheduler,events,adapters,utils}`.

## UI package

`@creative-lab/ui` is the single source of reusable interface primitives.
Applications consume UI from this package; domain packages do not own shared UI.

## Configuration package

`@creative-lab/config` centralizes shared tooling presets (ESLint, TypeScript,
Prettier, Tailwind, Vitest, Commitlint, lint-staged, shared constants).
Packages must not maintain independent divergent tooling standards.

## Document metadata

Every governing document must begin with mandatory metadata (see
[Documentation-Standards.md](./Documentation-Standards.md)):

- Document Title
- Document Identifier
- Version
- Status
- Last Updated
- Supersedes
- Owner
- Approved By
- Effective Date

Applies to: Platform Constitution, Engineering Standards, Architecture
Documents, ADRs, Epics, Design Standards, and future governance documents.

## Governance requirements

1. Authority order: Constitution → ADRs → Epics → Standards → Implementation.
2. Structural package/boundary changes require matrix, classification, manifest,
   and documentation updates in the same change.
3. Deviations must be explicit in delivery reports.
4. No undocumented architectural decisions.

## Architecture ownership

| Concern                             | Owner                             |
| ----------------------------------- | --------------------------------- |
| Constitution                        | Platform Engineering (governance) |
| ADRs                                | Platform Architecture             |
| Domain packages                     | Respective domain owners          |
| Infrastructure / core / config / ui | Platform Engineering              |
| Manifest accuracy                   | Platform Engineering              |
| Dependency enforcement scripts      | Platform Engineering              |

---

## Related

- [Folder-Structure.md](./Folder-Structure.md)
- [Domain Map](../architecture/domain-map.md)
- [Package Classification](../architecture/package-classification.md)
- [Package Dependencies](./package-dependencies.md)
