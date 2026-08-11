# Documentation Standards

| Field               | Value                                                    |
| ------------------- | -------------------------------------------------------- |
| Document Title      | Documentation Standards                                  |
| Document Identifier | STD-DOCUMENTATION-STANDARDS                              |
| Version             | BUILD-000A                                               |
| Status              | Accepted                                                 |
| Last Updated        | 2026-08-06                                               |
| Supersedes          | BUILD-000 Documentation Standards (pre-metadata mandate) |
| Owner               | Platform Engineering                                     |
| Approved By         | BUILD-000A                                               |
| Effective Date      | 2026-08-06                                               |

---

## Authority

Constitution Title III Article 12; Title IV; BUILD-000A-04 Documentation Governance.

## Hierarchy

1. Platform Constitution
2. ADRs
3. Epics
4. Engineering Standards
5. Package/app READMEs and code comments

## Governing document metadata

Every governing document **shall** begin (immediately after the primary title
heading) with mandatory metadata. Preferred presentation is a markdown table:

| Field               | Value |
| ------------------- | ----- |
| Document Title      | …     |
| Document Identifier | …     |
| Version             | …     |
| Status              | …     |
| Last Updated        | …     |
| Supersedes          | …     |
| Owner               | …     |
| Approved By         | …     |
| Effective Date      | …     |

### Applies to

- Platform Constitution
- Engineering Standards
- Architecture Documents
- ADR documents
- Epic documents
- Design Standards (when introduced)
- Future governance documents

### Does not apply to

- Package/app README files (still required; free-form purpose/boundaries)
- Ephemeral notes, PR descriptions, or commit messages

### Identifier conventions

| Kind         | Identifier pattern | Example           |
| ------------ | ------------------ | ----------------- |
| Constitution | `CONST-*`          | `CONST-PLATFORM`  |
| ADR          | `ADR-NNN`          | `ADR-008`         |
| Epic         | `EPIC-NNN`         | `EPIC-201`        |
| Standard     | `STD-*`            | `STD-PKG-DEPS`    |
| Architecture | `ARCH-*`           | `ARCH-DOMAIN-MAP` |

## Requirements

1. Every package and app has a README stating purpose and boundaries.
2. ADRs use the required sections: Status, Context, Decision, Consequences,
   Alternatives Considered (in addition to document metadata).
3. Epics use the required section set defined in `docs/epics/README.md`.
4. Documentation updates ship in the same change as behavior or boundary changes.
5. Prefer links to higher authority over copying text that can drift.
6. Architecture composition is reflected in `platform.manifest.json`.
7. Package dependency rules are documented in `docs/standards/package-dependencies.md`.

## Style

1. Write in complete sentences.
2. Avoid technology lock-in in the Constitution; technology belongs in ADRs.
3. Mark placeholders explicitly (`_TBD_`) rather than inventing false certainty.
4. Do not invent future version numbers; use existing repository identifiers
   (e.g. `BUILD-000`, `BUILD-000A`, package `0.0.0`).

## Decisions log

Operational, non-architectural choices may be recorded under `docs/decisions/`.
