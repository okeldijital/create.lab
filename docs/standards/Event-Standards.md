# Event Standards

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | Event Standards                              |
| Document Identifier | STD-EVENT-STANDARDS                          |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Engineering                         |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | 2026-08-06                                   |

---

## Authority

ADR-004 Event Architecture; Constitution Article 8.

## Naming

- Past-tense domain phrases: `MemberAdded`, `CapacityWindowDefined`.
- Avoid technical transport names (`MessageSentToQueue`).

## Payload

1. Include event name/type, occurred-at timestamp, and correlation identifiers
   when implemented.
2. Include `organizationId` for tenant-owned facts.
3. Payloads are immutable facts; do not embed behavior.
4. Prefer stable identifiers over denormalized blobs; include denormalized
   fields only when required for consumer autonomy.

## Versioning

1. Additive optional fields are preferred for evolution.
2. Breaking event changes require a new event type or explicit version field
   and consumer migration plan.

## Handlers

1. Idempotent processing.
2. No assumption of exactly-once delivery unless a future ADR guarantees it.
3. Handlers do not create reverse package dependencies; depend on event
   contracts, not producer internals.

## BUILD-000

Event infrastructure folders exist under `packages/core/src/events` only.
