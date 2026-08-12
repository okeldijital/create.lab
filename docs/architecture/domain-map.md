# Domain Map

| Field               | Value                                 |
| ------------------- | ------------------------------------- |
| Document Title      | Domain Map (Bounded Context Registry) |
| Document Identifier | ARCH-DOMAIN-MAP                       |
| Version             | BUILD-007                             |
| Status              | Accepted                              |
| Last Updated        | 2026-08-07                            |
| Supersedes          | BUILD-000A domain registry            |
| Owner               | Platform Architecture                 |
| Approved By         | BUILD-001                             |
| Effective Date      | 2026-08-06                            |

---

## Purpose

Authoritative registry of bounded contexts for the Creative Lab platform.
This document describes architecture only — no implementation details.

## Authority

- Platform Constitution Title II Articles 5–7
- ADR-001 Organization First
- ADR-008 Package Boundaries
- ADR-009 Domain Driven Design

---

## Context hierarchy

```text
Organization
    ↓
Workforce
    ↓
Capacity
    ↓
Scheduling
    ↓
Operations
    ↓
Projects
    ↓
Allocation
    ↓
Production
    ↓
Assets
    ↓
Review
    ↓
Delivery
    ↓
Billing
    ↓
CRM
    ↓
Services
    ↓
Quotation
    ↓
Contracts
    ↓
Engagement
    ↓
Portfolio
    ↓
Knowledge
```

Primary chain dependencies flow **downward only** (a context may depend on
upstream contexts; never reverse). See
[package-dependencies](../standards/package-dependencies.md).

---

## Domain: Organization

| Aspect                         | Definition                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**                    | Root tenancy context. Establishes the organizational unit within which all tenant work occurs.                                       |
| **Responsibilities**           | Organization lifecycle; department/team/studio structure; organization settings; tenant identity of the org.                         |
| **Owns**                       | `Organization`, `Department`, `Team`, `Studio`, `OrganizationSettings` aggregates (EPIC-201).                                        |
| **Consumes**                   | Core kernel contracts; infrastructure technical services (when needed).                                                              |
| **Produces**                   | Organization identity facts; structure events (`OrganizationCreated`, `DepartmentCreated`, …).                                       |
| **Forbidden responsibilities** | Users/employees; roles/permissions; workforce staffing; capacity; scheduling; allocation; UI; Payload collections as business rules. |
| **Upstream dependencies**      | Core (kernel); Infrastructure (technical); Config (tooling).                                                                         |
| **Downstream dependencies**    | Workforce, Capacity, Scheduling, Allocation, Operations, and satellites that require tenancy.                                        |
| **Primary aggregates**         | Organization (root); Department; Team; Studio; OrganizationSettings.                                                                 |
| **Implementation package**     | `@creative-lab/organization` — pure domain model (EPIC-201). Persistence adapters deferred to infrastructure.                        |
| **Future epics**               | EPIC-201 complete for domain model; future work may add dependent-domain delete guards and Workforce `headId` resolution.            |

---

## Domain: Workforce

| Aspect                         | Definition                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Purpose**                    | People and employment relationships within an organization (not auth users).                        |
| **Responsibilities**           | Worker lifecycle; positions; employment; contract metadata; reporting hierarchy.                    |
| **Owns**                       | `Worker`, `Position`, `Employment`, `EmploymentContract`, `ReportingRelationship` (EPIC-202).       |
| **Consumes**                   | Organization tenancy and structure (Department/Team IDs); core contracts.                           |
| **Produces**                   | Workforce facts and events consumed by capacity and scheduling.                                     |
| **Forbidden responsibilities** | Organization tenancy rules; schedule optimization; allocation engine; capacity math; identity/auth. |
| **Upstream dependencies**      | Organization, Core (EPIC-202 package uses organization + core only).                                |
| **Downstream dependencies**    | Capacity, Scheduling, Allocation, Operations.                                                       |
| **Primary aggregates**         | Worker (root for people); Position; Employment; EmploymentContract; ReportingRelationship.          |
| **Implementation package**     | `@creative-lab/workforce` — pure domain model (EPIC-202). Persistence adapters: BUILD-007 infrastructure. |
| **Future epics**               | EPIC-202 domain complete; payroll/leave/identity deferred.                                          |

---

## Domain: Capacity

| Aspect                         | Definition                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Resource planning: capability, measurable capacity, and general availability templates.                  |
| **Responsibilities**           | Capacity profiles for resources; capabilities; working patterns; reusable availability; quantities.      |
| **Owns**                       | `CapacityProfile`, `Capability`, `AvailabilityProfile`, `WorkingPattern`, `ResourceCapacity` (EPIC-203). |
| **Consumes**                   | Organization tenancy; Workforce/Studio resource IDs (opaque); core kernel.                               |
| **Produces**                   | Capacity facts/events for Scheduling and Allocation.                                                     |
| **Forbidden responsibilities** | Scheduling time slots; assignments; hiring/HR; calendar UI; organization membership ownership.           |
| **Upstream dependencies**      | Workforce, Organization, Core (package uses core + organization + workforce).                            |
| **Downstream dependencies**    | Scheduling, Allocation, Operations.                                                                      |
| **Primary aggregates**         | CapacityProfile (root per resource); Capability; AvailabilityProfile; WorkingPattern; ResourceCapacity.  |
| **Implementation package**     | `@creative-lab/capacity` — pure domain model (EPIC-203). Persistence adapters: BUILD-012 infrastructure. |
| **Future epics**               | EPIC-203 domain complete; equipment resource types; scheduling consumption.                              |

---

## Domain: Scheduling

| Aspect                         | Definition                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Purpose**                    | Temporal planning: when time is reserved (calendars, schedules, blocks, bookings, shifts).       |
| **Responsibilities**           | Schedule/calendar lifecycle; non-overlapping time blocks; booking lifecycle; shift templates.    |
| **Owns**                       | `Schedule`, `Calendar`, `TimeBlock`, `Booking`, `Shift` (EPIC-204).                              |
| **Consumes**                   | Organization tenancy; Capacity WorkingPattern IDs; core kernel (workforce allowed by matrix).    |
| **Produces**                   | Schedule facts/events for Allocation and Operations.                                             |
| **Forbidden responsibilities** | Worker/studio selection; capacity math; final assignment (Allocation); org membership ownership. |
| **Upstream dependencies**      | Capacity, Workforce, Organization, Core.                                                         |
| **Downstream dependencies**    | Allocation, Operations.                                                                          |
| **Primary aggregates**         | Schedule (root of planned time); Calendar; TimeBlock; Booking; Shift.                            |
| **Implementation package**     | `@creative-lab/scheduling` — pure domain model (EPIC-204).                                       |
| **Future epics**               | EPIC-204 domain complete; Allocation consumes bookings/time blocks.                              |

---

## Domain: Allocation

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Manage commitments between resources and work (who is committed to what).                                                           |
| **Responsibilities**           | Allocations, allocation groups, reservations; commitment conflict detection (no capacity math).                                     |
| **Owns**                       | `Allocation`, `AllocationGroup`, `Reservation` (EPIC-208).                                                                          |
| **Consumes**                   | ProjectId (Projects); WorkOrderId (Operations); ResourceId (Capacity); org tenancy.                                                 |
| **Produces**                   | Allocation/reservation lifecycle events.                                                                                            |
| **Forbidden responsibilities** | Capacity formulas; scheduling; executing work; owning projects/work orders; UI; infrastructure.                                    |
| **Upstream dependencies**      | Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core.                                                          |
| **Downstream dependencies**    | Production; reporting / analytics / billing consumers of commitment history.                                                        |
| **Primary aggregates**         | Allocation; AllocationGroup; Reservation.                                                                                           |
| **Implementation package**     | `@creative-lab/allocation` — pure domain model (EPIC-208).                                                                          |
| **Future epics**               | EPIC-208 domain complete; adapters deferred.                                                                                        |


## Domain: Operations

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Model work **execution** after planning ends (what actually happened).                                                              |
| **Responsibilities**           | Work orders, sessions, milestones, output metadata, incidents; execution history and operational status.                            |
| **Owns**                       | `WorkOrder`, `WorkSession`, `WorkMilestone`, `WorkOutput`, `WorkIncident` (EPIC-206).                                               |
| **Consumes**                   | Allocation (commitment refs); Booking (Scheduling); org tenancy; workforce/capacity facts via upstream chain only.                  |
| **Produces**                   | Execution lifecycle events for reporting, analytics, billing, and automation.                                                       |
| **Forbidden responsibilities** | Owning projects/tasks; file storage; redefining Allocation/Scheduling/Capacity/Workforce/Organization; UI; infrastructure.          |
| **Upstream dependencies**      | Scheduling, Capacity, Workforce, Organization, Core.                                                                                |
| **Downstream dependencies**    | Reporting / Analytics / Billing (future consumers of execution history).                                                            |
| **Primary aggregates**         | WorkOrder (root); WorkSession; WorkMilestone; WorkOutput (metadata); WorkIncident.                                                  |
| **Implementation package**     | `@creative-lab/operations` — pure domain model (EPIC-206).                                                                          |
| **Future epics**               | EPIC-206 domain complete; adapters and reporting consumers deferred.                                                                |

### Package note

`packages/operations` implements the Operations bounded context as a pure domain package.
It references Allocation and Booking identities without mutating planning domains.

---

## Domain: Projects

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Business coordination of initiatives (why work exists; structure; progress).                                                        |
| **Responsibilities**           | Projects, phases, deliverables, inter-project dependencies, measurable objectives.                                                  |
| **Owns**                       | `Project`, `ProjectPhase`, `Deliverable`, `ProjectDependency`, `ProjectObjective` (EPIC-207).                                       |
| **Consumes**                   | Operations (WorkOrder IDs); Allocation/Booking IDs as optional refs; org tenancy; upstream planning chain.                          |
| **Produces**                   | Project lifecycle, phase, deliverable, objective, and dependency events.                                                            |
| **Forbidden responsibilities** | Owning execution, tasks, scheduling, allocation, billing, CRM, file storage, UI, infrastructure.                                    |
| **Upstream dependencies**      | Operations, Scheduling, Capacity, Workforce, Organization, Core.                                                                    |
| **Downstream dependencies**    | Allocation (commitments); CRM, Billing, Analytics, Portfolio (future).                                                              |
| **Primary aggregates**         | Project (root); ProjectPhase; Deliverable; ProjectDependency; ProjectObjective.                                                     |
| **Implementation package**     | `@creative-lab/projects` — pure domain model (EPIC-207).                                                                            |
| **Future epics**               | EPIC-207 domain complete; portfolio and CRM consumers deferred.                                                                     |

### Package note

`packages/projects` coordinates business initiatives. Deliverables reference WorkOrder
identities without owning Operations data.

---

## Domain: Production

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Own the lifecycle of creative production execution (sessions, milestones, revisions, completion).                                   |
| **Responsibilities**           | Production progress tracking; sessions; milestones; revision cycles.                                                                |
| **Owns**                       | `Production`, `ProductionSession`, `ProductionMilestone`, `Revision` (EPIC-209).                                                    |
| **Consumes**                   | ProjectId (Projects); WorkOrderId (Operations); org tenancy; opaque allocation/owner refs.                                          |
| **Produces**                   | Production, session, milestone, and revision events.                                                                                |
| **Forbidden responsibilities** | Owning projects/work orders; scheduling; allocation; assets; finance; UI; infrastructure.                                           |
| **Upstream dependencies**      | Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core.                                              |
| **Downstream dependencies**    | Assets; reporting / analytics consumers of production history.                                                                      |
| **Primary aggregates**         | Production; ProductionSession; ProductionMilestone; Revision.                                                                       |
| **Implementation package**     | `@creative-lab/production` — pure domain model (EPIC-209).                                                                          |
| **Future epics**               | EPIC-209 domain complete; adapters deferred.                                                                                        |

---

## Domain: Review

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Manage creative review and approval lifecycle (requests, sessions, decisions, history).                                             |
| **Responsibilities**           | Reviews, approvals, sessions, immutable decisions.                                                                                  |
| **Owns**                       | `Review`, `Approval`, `ReviewSession`, `ReviewDecision` (EPIC-211).                                                                 |
| **Consumes**                   | ProjectId, ProductionId, AssetId, OrganizationId as opaque refs.                                                                    |
| **Produces**                   | Review, approval, session, and decision events.                                                                                     |
| **Forbidden responsibilities** | Files; production; revisions; comments; delivery; notifications; UI; infrastructure.                                                |
| **Upstream dependencies**      | Assets, Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core.                          |
| **Downstream dependencies**    | Delivery; analytics consumers (future).                                                                                             |
| **Primary aggregates**         | Review; Approval; ReviewSession; ReviewDecision.                                                                                    |
| **Implementation package**     | `@creative-lab/review` — pure domain model (EPIC-211).                                                                              |
| **Future epics**               | EPIC-211 domain complete; adapters deferred.                                                                                        |

---

## Domain: Delivery

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Own official delivery state of approved work (has it been delivered?).                                                              |
| **Responsibilities**           | Deliveries, packages, items (asset version refs), receipts.                                                                         |
| **Owns**                       | `Delivery`, `DeliveryPackage`, `DeliveryItem`, `DeliveryReceipt` (EPIC-212).                                                        |
| **Consumes**                   | ProjectId, ProductionId, ReviewId, AssetId, AssetVersionId, OrganizationId as opaque refs.                                          |
| **Produces**                   | Delivery, package, item, and receipt events.                                                                                        |
| **Forbidden responsibilities** | Storage; file transfer; downloads; invoices; notifications; UI; infrastructure.                                                     |
| **Upstream dependencies**      | Review, Assets, Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core.                  |
| **Downstream dependencies**    | Billing; client portals / notifications (future consumers).                                                                         |
| **Primary aggregates**         | Delivery; DeliveryPackage; DeliveryItem; DeliveryReceipt.                                                                           |
| **Implementation package**     | `@creative-lab/delivery` — pure domain model (EPIC-212).                                                                            |
| **Future epics**               | EPIC-212 domain complete; transfer adapters deferred.                                                                               |

---

## Domain: Billing

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Own commercial lifecycle after delivery (what is owed, invoiced, and paid).                                                         |
| **Responsibilities**           | Invoices, lines, payment business records, credit notes.                                                                            |
| **Owns**                       | `Invoice`, `InvoiceLine`, `Payment`, `CreditNote` (EPIC-213).                                                                       |
| **Consumes**                   | ProjectId, DeliveryId, OrganizationId as opaque refs; customerId string.                                                            |
| **Produces**                   | Invoice, payment, and credit-note domain events.                                                                                    |
| **Forbidden responsibilities** | Payment gateways; banking; tax filing; PDF/email; bookkeeping; ERP; UI; infrastructure.                                             |
| **Upstream dependencies**      | Delivery, Review, Assets, Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core.       |
| **Downstream dependencies**    | CRM; reporting / client portals / payment adapters (future consumers).                                                              |
| **Primary aggregates**         | Invoice; InvoiceLine; Payment; CreditNote.                                                                                          |
| **Implementation package**     | `@creative-lab/billing` — pure domain model (EPIC-213).                                                                             |
| **Future epics**               | EPIC-213 domain complete; gateway/PDF/email adapters deferred.                                                                      |

---

## Domain: CRM

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Own business relationship lifecycle (customers, contacts, opportunities, interactions).                                             |
| **Responsibilities**           | Customer status, contacts, sales opportunities, communication history.                                                              |
| **Owns**                       | `Customer`, `Contact`, `Opportunity`, `Interaction` (EPIC-214).                                                                     |
| **Consumes**                   | OrganizationId; optional ProjectId; billing customer refs by opaque id/number only.                                                 |
| **Produces**                   | Customer, contact, opportunity, and interaction domain events.                                                                      |
| **Forbidden responsibilities** | Invoicing; project execution; production; email sending; external CRM sync; marketing; documents; auth; UI; infrastructure.         |
| **Upstream dependencies**      | Billing, Delivery, Review, Assets, Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core. |
| **Downstream dependencies**    | Services; client portals / reporting (future consumers).                                                                            |
| **Primary aggregates**         | Customer; Contact; Opportunity; Interaction.                                                                                        |
| **Implementation package**     | `@creative-lab/crm` — pure domain model (EPIC-214).                                                                                 |
| **Future epics**               | EPIC-214 domain complete; external CRM adapters deferred.                                                                           |

---

## Domain: Services

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Own commercial service catalogue and standard pricing rules.                                                                        |
| **Responsibilities**           | Services, categories, price books, price rules.                                                                                     |
| **Owns**                       | `Service`, `ServiceCategory`, `PriceBook`, `PriceRule` (EPIC-215).                                                                  |
| **Consumes**                   | OrganizationId as opaque tenancy.                                                                                                   |
| **Produces**                   | Service, category, price book, and price rule domain events.                                                                        |
| **Forbidden responsibilities** | Quotes; invoices; tax; payments; subscriptions; project/production execution; UI; infrastructure.                                   |
| **Upstream dependencies**      | CRM, Billing, Delivery, Review, Assets, Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core. |
| **Downstream dependencies**    | Quotation; commercial applications (future consumers).                                                                              |
| **Primary aggregates**         | Service; ServiceCategory; PriceBook; PriceRule.                                                                                     |
| **Implementation package**     | `@creative-lab/services` — pure domain model (EPIC-215).                                                                            |
| **Future epics**               | EPIC-215 domain complete; quote/invoice integration deferred.                                                                       |

---

## Domain: Quotation

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Own commercial quotation lifecycle (offer, versions, lines, customer response).                                                     |
| **Responsibilities**           | Quotes, versions, lines, approvals.                                                                                                 |
| **Owns**                       | `Quote`, `QuoteVersion`, `QuoteLine`, `QuoteApproval` (EPIC-216).                                                                   |
| **Consumes**                   | CustomerId, OpportunityId (CRM); ServiceId (services); OrganizationId.                                                              |
| **Produces**                   | Quote, version, line, and approval domain events.                                                                                   |
| **Forbidden responsibilities** | Project creation; invoicing; tax; payments; allocation; production; PDF/email; UI; infrastructure.                                  |
| **Upstream dependencies**      | Services, CRM, Billing, Delivery, Review, Assets, Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core. |
| **Downstream dependencies**    | Contracts; projects (opaque accepted-quote refs); billing conversion (future).                                                      |
| **Primary aggregates**         | Quote; QuoteVersion; QuoteLine; QuoteApproval.                                                                                      |
| **Implementation package**     | `@creative-lab/quotation` — pure domain model (EPIC-216).                                                                           |
| **Future epics**               | EPIC-216 domain complete; project/invoice conversion deferred.                                                                      |

---

## Domain: Contracts

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Own contractual agreements between organization and customers.                                                                      |
| **Responsibilities**           | Contracts, versions, terms, amendments.                                                                                             |
| **Owns**                       | `Contract`, `ContractVersion`, `ContractTerm`, `ContractAmendment` (EPIC-217).                                                      |
| **Consumes**                   | CustomerId (CRM); QuoteId (quotation); OrganizationId.                                                                              |
| **Produces**                   | Contract, version, term, and amendment domain events.                                                                               |
| **Forbidden responsibilities** | PDF/signature storage; project creation; invoicing; payments; production; scheduling; email; legal engines; UI; infrastructure.     |
| **Upstream dependencies**      | Quotation, Services, CRM, Billing, Delivery, Review, Assets, Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core. |
| **Downstream dependencies**    | Engagement; projects / compliance (future consumers).                                                                               |
| **Primary aggregates**         | Contract; ContractVersion; ContractTerm; ContractAmendment.                                                                         |
| **Implementation package**     | `@creative-lab/contracts` — pure domain model (EPIC-217). Persistence adapters: BUILD-010 infrastructure.                           |
| **Future epics**               | EPIC-217 domain complete; signature/document adapters deferred.                                                                     |

---

## Domain: Engagement

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Contractual execution layer—formal work initiated under an active contract.                                                         |
| **Responsibilities**           | Engagements, deliverables, milestones, obligations.                                                                                 |
| **Owns**                       | `Engagement`, `Deliverable`, `Milestone`, `Obligation` (EPIC-218).                                                                  |
| **Consumes**                   | ContractId; CustomerId; optional ProjectId; OrganizationId.                                                                         |
| **Produces**                   | Engagement, deliverable, milestone, and obligation domain events.                                                                   |
| **Forbidden responsibilities** | Work orders; scheduling; allocation; production; review; delivery; invoicing; file storage; UI; infrastructure.                     |
| **Upstream dependencies**      | Contracts, Quotation, Services, CRM, Billing, Delivery, Review, Assets, Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core. |
| **Downstream dependencies**    | Portfolio; operations / projects (opaque engagement refs; future).                                                                  |
| **Primary aggregates**         | Engagement; Deliverable; Milestone; Obligation.                                                                                     |
| **Implementation package**     | `@creative-lab/engagement` — pure domain model (EPIC-218).                                                                          |
| **Future epics**               | EPIC-218 domain complete; ops linkage deferred.                                                                                     |

---

## Domain: Portfolio

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Strategic portfolio governance—programs, initiatives, and portfolio milestones.                                                     |
| **Responsibilities**           | Portfolios, programs, initiatives, portfolio milestones.                                                                            |
| **Owns**                       | `Portfolio`, `Program`, `Initiative`, `PortfolioMilestone` (EPIC-219).                                                              |
| **Consumes**                   | EngagementId, ProjectId, OrganizationId as opaque refs.                                                                             |
| **Produces**                   | Portfolio, program, initiative, and milestone domain events.                                                                        |
| **Forbidden responsibilities** | Project execution; work orders; allocation; scheduling; production; finances; reporting calc; documents; UI; infrastructure.        |
| **Upstream dependencies**      | Engagement, Contracts, Quotation, Services, CRM, Billing, Delivery, Review, Assets, Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core. |
| **Downstream dependencies**    | Knowledge; reporting / strategy consumers (future).                                                                                 |
| **Primary aggregates**         | Portfolio; Program; Initiative; PortfolioMilestone.                                                                                 |
| **Implementation package**     | `@creative-lab/portfolio` — pure domain model (EPIC-219).                                                                           |
| **Future epics**               | EPIC-219 domain complete; reporting adapters deferred.                                                                              |

---

## Domain: Knowledge

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Organizational knowledge identity, lifecycle, taxonomy, and governance.                                                             |
| **Responsibilities**           | Knowledge articles, versions, categories, directed references.                                                                      |
| **Owns**                       | `KnowledgeArticle`, `KnowledgeVersion`, `KnowledgeCategory`, `KnowledgeReference` (EPIC-220).                                      |
| **Consumes**                   | OrganizationId as opaque ref; Portfolio is upstream on the chain (no required ID coupling).                                         |
| **Produces**                   | Article, version, category, and reference domain events.                                                                            |
| **Forbidden responsibilities** | File storage; binary documents; search engines; document generation; website publishing; permissions; notifications; AI; UI.        |
| **Upstream dependencies**      | Portfolio, Engagement, Contracts, Quotation, Services, CRM, Billing, Delivery, Review, Assets, Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core. |
| **Downstream dependencies**    | _(none — terminal business domain)_                                                                                                 |
| **Primary aggregates**         | KnowledgeArticle; KnowledgeVersion; KnowledgeCategory; KnowledgeReference.                                                          |
| **Implementation package**     | `@creative-lab/knowledge` — pure domain model (EPIC-220). Persistence adapters: BUILD-011 infrastructure.                           |
| **Future epics**               | EPIC-220 domain complete; content/search adapters deferred to infrastructure.                                                       |

---

## Satellite domains

Not on the primary chain; limited coupling to Organization + Core.

### Collaboration

| Aspect        | Definition                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------- |
| **Purpose**   | Collaborative artifacts and interactions within an organization.                               |
| **Upstream**  | Organization, Core.                                                                            |
| **Package**   | `@creative-lab/collaboration` (scaffold).                                                      |
| **Forbidden** | Reverse dependencies into Organization internals; joining the main planning chain without ADR. |

### Assets

| Aspect                         | Definition                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Own creative asset identity, classification, versioning, collections, and relationships (no storage).                               |
| **Responsibilities**           | Asset lifecycle; immutable sequential versions; collections; directed relationships.                                                |
| **Owns**                       | `Asset`, `AssetVersion`, `AssetCollection`, `AssetRelationship` (EPIC-210).                                                         |
| **Consumes**                   | ProductionId, ProjectId, OrganizationId as opaque refs.                                                                             |
| **Produces**                   | Asset, version, collection, and relationship events.                                                                                |
| **Forbidden responsibilities** | File storage/paths/binaries; delivery; permissions; production/review ownership; UI; infrastructure.                                |
| **Upstream dependencies**      | Production, Allocation, Projects, Operations, Scheduling, Capacity, Workforce, Organization, Core.                                  |
| **Downstream dependencies**    | Review; Delivery / security consumers (future).                                                                                     |
| **Primary aggregates**         | Asset; AssetVersion; AssetCollection; AssetRelationship.                                                                            |
| **Implementation package**     | `@creative-lab/assets` — pure domain model (EPIC-210).                                                                              |
| **Future epics**               | EPIC-210 domain complete; storage adapters in infrastructure.                                                                       |


## Application Layer (BUILD-001)

| Aspect | Definition |
| ------ | ---------- |
| **Purpose** | Orchestrate domain packages into use cases without business rules. |
| **Package** | `@creative-lab/application` |
| **May import** | All domain packages + core (+ infrastructure/config per matrix) |
| **Must not** | Host business rules; implement persistence/UI/HTTP; be imported by domains |

---

## Supporting non-domain packages

| Package          | Role relative to domains                                 |
| ---------------- | -------------------------------------------------------- |
| `core`           | Domain kernel — shared contracts, not a business domain. |
| `infrastructure` | Technical adapters — not a business domain.              |
| `config`         | Tooling configuration — not a business domain.           |
| `ui`             | Presentation library — not a business domain.            |
| `test-utils`     | Test support — not a business domain.                    |

---

## Change control

Adding or renaming a bounded context requires updates to this registry, the
dependency matrix, package classification, platform manifest, and (where
architectural) an ADR.
