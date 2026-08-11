# ADR-007: Payload Integration

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | ADR 007 payload integration                  |
| Document Identifier | ADR-007                                      |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Architecture                        |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | BUILD-000                                    |

---

## Status

Accepted

## Context

Creative Lab includes a CMS application for configuration and content-oriented
administration. Payload CMS is the designated CMS integration target for the
platform reconstitution. Domain logic must not become trapped inside CMS
framework code.

## Decision

1. **Payload CMS** is the CMS framework for `apps/cms`.
2. Collections, access functions, and hooks in `apps/cms` are **adapters**.
   Business invariants and use-cases live in `packages/*`.
3. CMS shall not become the system of record for domain rules; it may persist
   documents that map to domain concepts via explicit boundaries.
4. Access control in Payload must enforce the same authorization intent as
   ADR-005 through thin adapters.
5. BUILD-000 provides folder scaffolding only; no collections are implemented
   until governed epics require them.
6. Payload-specific conventions are detailed in Payload-Standards.md and must
   not contradict this ADR or the Constitution.

## Consequences

### Positive

- Clear split between CMS UX and domain packages.
- Easier testing of domain without CMS boot.
- Controlled adoption path per epic.

### Negative

- Mapping overhead between CMS documents and domain models.
- Framework upgrades require adapter maintenance.

## Alternatives Considered

1. **Domain logic inside Payload hooks only** — Rejected: couples core
   business to CMS lifecycle.
2. **Custom CMS from scratch** — Rejected: unnecessary cost for reconstitution.
3. **Headless CMS SaaS only** — Rejected for default: weaker alignment with
   monorepo domain packages and tenancy model.
