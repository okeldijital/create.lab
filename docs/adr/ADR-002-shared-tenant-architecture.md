# ADR-002: Shared Tenant Architecture

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | ADR 002 shared tenant architecture           |
| Document Identifier | ADR-002                                      |
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

Multi-tenant systems may isolate tenants via separate deployments, separate
databases, or shared infrastructure with logical isolation. Creative Lab must
balance operational cost, evolution speed, and strict tenant safety.

## Decision

1. Adopt **shared-tenant architecture**: shared application runtime and shared
   persistence patterns with **logical isolation by organization (tenant)**.
2. Every tenant-owned record shall carry a stable **organization identifier**.
3. All read/write paths for tenant data shall enforce organization scope at
   the application and repository boundaries.
4. Physical isolation (dedicated DB per tenant) is not the default; it may be
   introduced later for specific tiers only via a superseding ADR.
5. Shared reference data that is not tenant-owned must be explicitly
   classified as platform-global.

## Consequences

### Positive

- Lower operational overhead for early and mid-scale growth.
- Single schema evolution path.
- Uniform security controls and observability.

### Negative

- Requires rigorous query discipline; mistakes can cause cross-tenant leaks.
- Noisy-neighbor performance risks under extreme imbalance.

### Neutral

- Backup/restore per tenant is harder than siloed tenancy and needs tooling.

## Alternatives Considered

1. **Database-per-tenant** — Deferred: strong isolation, high ops cost and
   migration friction for BUILD-000 reconstitution.
2. **Schema-per-tenant** — Rejected for default: complex migrations and
   tooling without sufficient benefit over row-level tenancy.
3. **Deployment-per-tenant** — Rejected for default: incompatible with
   product cost structure and shared collaboration patterns.
