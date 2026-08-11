# Platform Constitution

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | Platform Constitution                        |
| Document Identifier | CONST-PLATFORM                               |
| Version             | BUILD-000                                    |
| Status              | Ratified                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Engineering                         |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | BUILD-000 ratification                       |

---

**Creative Lab Platform**  
**Document status:** Ratified for BUILD-000  
**Authority rank:** Supreme engineering authority  
**Nature:** Implementation-independent

---

This Constitution is the supreme engineering authority of the Creative Lab
platform. All Architecture Decision Records, Epic Specifications, Engineering
Standards, and Implementation shall conform to it. Where conflict exists, this
Constitution prevails.

No provision of this Constitution shall prescribe a specific programming
language, framework, database, cloud vendor, or third-party product. Technology
choices are recorded in Architecture Decision Records subordinate to this text.

---

# Title I — Platform Foundation

## Article 1 — Vision

The Creative Lab platform shall enable organizations to plan, staff, schedule,
and allocate creative work with clarity, accountability, and multi-tenant safety.
The platform shall remain coherent as a system of bounded contexts, not a
monolithic application of ad-hoc features.

## Article 2 — Purpose

This Constitution establishes permanent rules for architecture, engineering
practice, and governance so that:

1. Reconstruction and evolution remain consistent after any loss of code or
   institutional knowledge.
2. Teams share a single hierarchy of authority for technical decisions.
3. Quality, tenancy, and domain integrity are non-negotiable.

## Article 3 — Scope

This Constitution governs:

1. All source code, packages, and applications in the monorepo.
2. All documentation that constrains implementation.
3. All processes for change control of architecture and standards.

This Constitution does not govern commercial product strategy, pricing, or
legal contracts, except where those concerns intersect platform multi-tenancy,
authorization, or data isolation.

## Article 4 — Principles

1. **Organization first.** Every domain concern is subordinate to the
   organizational context in which it exists.
2. **Explicit boundaries.** Bounded contexts and package boundaries are
   first-class; implicit coupling is forbidden.
3. **Tenant safety.** Shared infrastructure must never compromise tenant
   isolation of data or authorization decisions.
4. **Events over silent side effects.** Cross-context reactions are expressed
   as domain events, not hidden mutual imports.
5. **Repositories over direct persistence.** Domain code depends on
   repository abstractions, not storage engines.
6. **Testability by construction.** Design shall admit automated verification
   at unit, integration, and acceptance levels.
7. **Documentation as authority.** Undocumented architecture is incomplete
   architecture.
8. **Permanence over expedience.** Temporary shortcuts that violate this
   Constitution are not permitted.

---

# Title II — Architecture

## Article 5 — Organization First

1. The **Organization** is the root aggregate of tenancy and membership.
2. Domain models that represent work, people, capacity, schedules, or
   allocations shall be interpretable only within an organizational context
   unless explicitly designated as platform-global infrastructure.
3. Features shall not be designed as user-global when they are organization-
   scoped.

## Article 6 — Multi-tenancy

1. The platform adopts a **shared-tenant architecture**: shared runtime and
   schema patterns with strict logical isolation by tenant (organization).
2. Every persistence operation that touches tenant data shall be tenant-scoped.
3. Authorization decisions shall incorporate organizational membership and role.
4. Cross-tenant access is forbidden unless an explicit, audited platform
   administration pathway is defined by a higher or equal authority document
   subordinate only to this Constitution (an ADR).

## Article 7 — Bounded Contexts

1. The platform is composed of bounded contexts aligned to packages, including
   but not limited to: Organization, Workforce, Capacity, Scheduling,
   Allocation, Collaboration, and Assets, with Core as shared infrastructure.
2. Each context owns its ubiquitous language, invariants, and published API.
3. Contexts shall not reach into another context’s internal modules.
4. Integration between contexts occurs through published types, application
   services, and domain events — not through shared mutable state.

## Article 8 — Event Driven Architecture

1. Significant state changes that other contexts must observe shall emit
   domain events.
2. Event contracts are part of the public surface of a context.
3. Consumers must tolerate at-least-once delivery semantics unless an ADR
   specifies stronger guarantees.
4. Event handlers shall be idempotent where practical.
5. Events are not a substitute for synchronous commands within a single
   context’s transactional boundary.

## Article 9 — Repository Pattern

1. Domain and application layers depend on repository interfaces, not on
   concrete storage clients.
2. Repositories express collection-oriented persistence of aggregates.
3. Query complexity that does not fit a repository shall be isolated behind
   explicit query ports, not leaked into UI or unrelated contexts.
4. Storage technology is an implementation detail subordinate to this Article.

## Article 10 — Dependency Rules

1. Dependencies between packages flow in one direction only, as defined by the
   approved dependency graph and ADR-008.
2. Circular dependencies are forbidden.
3. Lower-level packages shall not import higher-level packages.
4. Applications may compose packages; packages shall not depend on applications.
5. Dependency violations are quality-gate failures.

---

# Title III — Engineering Standards

## Article 11 — Code Standards

1. Code shall be clear, typed, and reviewable.
2. Public APIs shall be intentional; accidental exports are defects.
3. Side effects shall be obvious at call sites.
4. Detailed conventions live in Engineering Standards documents and must not
   contradict this Constitution.

## Article 12 — Documentation Standards

1. Every package and application shall maintain a README describing purpose
   and boundaries.
2. Architectural decisions of lasting effect require ADRs.
3. Epics define product and technical scope before substantial implementation.
4. Documentation shall stay current with merged changes that affect behavior
   or boundaries.

## Article 13 — Testing Standards

1. Automated tests are part of the Definition of Done.
2. Tests protect invariants, contracts, and regression-prone behavior.
3. Test strategy (unit, integration, acceptance) is defined by ADR-010 and
   Testing Standards.
4. Flaky tests are defects.

## Article 14 — Definition of Done

Work is done only when all of the following hold:

1. Behavior matches the governing Epic (or agreed defect scope).
2. Code conforms to this Constitution, applicable ADRs, and Standards.
3. Typecheck, lint, dependency graph, and tests pass in CI.
4. Public surfaces and docs are updated.
5. No known tenant-isolation or authorization regressions are introduced.
6. Review has accepted the change.

---

# Title IV — Governance

## Article 15 — ADR Process

1. Architecture Decision Records document significant, durable choices.
2. An ADR includes at minimum: Status, Context, Decision, Consequences, and
   Alternatives Considered.
3. ADRs may be Proposed, Accepted, Deprecated, or Superseded.
4. Implementation shall not contradict an Accepted ADR.
5. Supersession requires a new ADR that references the prior record.

## Article 16 — Amendment Process

1. Amendments to this Constitution require an explicit change record stating:
   - Articles affected
   - Motivation
   - Compatibility impact on existing ADRs and Epics
2. Amendments shall preserve tenant safety and Organization-first principles
   unless a supermajority product-and-engineering decision is recorded in the
   change record.
3. Editorial corrections that do not change meaning may proceed without a
   formal amendment record.

## Article 17 — Versioning

1. The Constitution is versioned by date of ratification or amendment and by
   semantic intent (breaking vs. clarifying).
2. Packages and public APIs follow versioning rules defined in Engineering
   Standards; semantic versioning is preferred for published surfaces.
3. Breaking changes to public package APIs require changelog entries and,
   where architectural, an ADR.

## Article 18 — Compliance

1. Continuous integration enforces mechanical compliance (types, lint, tests,
   dependency graph, build).
2. Human review enforces semantic compliance with this Constitution.
3. Known deviations must be listed in delivery reports until remediated.
4. Willful non-compliance is not an acceptable delivery strategy.

---

## Ratification

Ratified as the founding Constitution of the Creative Lab platform engineering
system under **BUILD-000 — Platform Reconstitution**.

**Hierarchy reminder**

```
Platform Constitution
        ↓
Architecture Decision Records
        ↓
Epic Specifications
        ↓
Engineering Standards
        ↓
Implementation
```
