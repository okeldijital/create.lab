# ADR-008: Package Boundaries

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| Document Title      | ADR-008 Package Boundaries                           |
| Document Identifier | ADR-008                                              |
| Version             | BUILD-000A                                           |
| Status              | Accepted                                             |
| Last Updated        | 2026-08-06                                           |
| Supersedes          | BUILD-000 package boundary graph (domain chain only) |
| Owner               | Platform Architecture                                |
| Approved By         | BUILD-000A                                           |
| Effective Date      | 2026-08-06                                           |

---

## Status

Accepted

## Context

A monorepo without enforced package boundaries decays into circular imports
and unclear ownership. The Constitution requires directed dependencies and
bounded contexts.

BUILD-000 established the domain chain. BUILD-000A adds platform layers
(`config`, `infrastructure`, `ui`) and a formal dependency matrix so that
framework-agnostic kernel code, technical adapters, shared configuration, and
presentation remain separated from business domains.

## Decision

1. Domain packages map to bounded contexts under `packages/`.
2. Platform packages are classified as Domain Kernel (`core`), Infrastructure
   (`infrastructure`), Platform Configuration (`config`), Presentation Library
   (`ui`), and Test Support (`test-utils`). See package classification.
3. The **formal allowed dependency matrix** is defined in
   `docs/standards/package-dependencies.md` and enforced by
   `scripts/check-deps.mjs`. Summary:

   | Package        | May import                                                                  |
   | -------------- | --------------------------------------------------------------------------- |
   | core           | none                                                                        |
   | config         | none                                                                        |
   | ui             | core, config                                                                |
   | infrastructure | core, config                                                                |
   | organization   | core, infrastructure, config                                                |
   | workforce      | organization, core, infrastructure, config                                  |
   | capacity       | workforce, organization, core, infrastructure, config                       |
   | scheduling     | capacity, workforce, organization, core, infrastructure, config             |
   | allocation     | scheduling, capacity, workforce, organization, core, infrastructure, config |

4. **Domain chain visualization** (business packages only):

   ```
   organization → workforce → capacity → scheduling → allocation
   ```

   All domain packages may also depend on `core`, `infrastructure`, and
   `config` as listed above.

5. **Satellite packages** (`collaboration`, `assets`) may depend on `core`
   and `organization` only, unless a future ADR expands their graph.
6. **Forbidden**: reverse edges, circular dependencies, domain → ui,
   infrastructure → domain, core → anything, config → anything internal,
   packages → applications.
7. **Applications** (`apps/web`, `apps/cms`) may depend on packages; packages
   must not depend on applications.
8. **`@creative-lab/test-utils`** may be used as a dev-oriented shared test
   package without participating in domain layering.
9. Public API of each package is its package entry export surface.
10. `platform.manifest.json` records the composition snapshot including the
    dependency matrix.

## Consequences

### Positive

- Predictable architecture for EPIC reconstruction.
- Mechanical enforcement reduces review burden.
- Clear ownership of modules.
- Framework-agnostic `core` protected from Payload and other adapters.
- Shared UI and tooling presets have a single home.

### Negative

- Some shared concepts must be carefully placed in `core` or duplicated as
  anti-corruption types.
- Graph changes require ADR amendment discipline plus matrix/manifest updates.

## Alternatives Considered

1. **Single domain package** — Rejected: recreates the monolith.
2. **Unrestricted internal imports** — Rejected: guarantees cycles over time.
3. **Nx enforce-module-boundaries only** — Tooling may be added later; explicit
   graph script is the permanent rule source for BUILD-000 / BUILD-000A.
4. **Placing adapters in core** — Rejected under BUILD-000A: keeps core
   framework-agnostic; adapters live in `infrastructure`.
