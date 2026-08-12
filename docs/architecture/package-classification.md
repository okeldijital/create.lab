# Package Classification

| Field               | Value                     |
| ------------------- | ------------------------- |
| Document Title      | Package Classification    |
| Document Identifier | ARCH-PKG-CLASS            |
| Version             | BUILD-007                 |
| Status              | Accepted                  |
| Last Updated        | 2026-08-07                |
| Supersedes          | BUILD-000A classification |
| Owner               | Platform Architecture     |
| Approved By         | BUILD-001                 |
| Effective Date      | 2026-08-06                |

---

## Purpose

Classify every package in the monorepo by architectural role so ownership,
dependencies, and lifecycle expectations remain explicit.

## Summary matrix

| Package          | Classification              |
| ---------------- | --------------------------- |
| `core`           | Domain Kernel               |
| `infrastructure` | Infrastructure              |
| `config`         | Platform Configuration      |
| `ui`             | Presentation Library        |
| `organization`   | Business Domain             |
| `workforce`      | Business Domain             |
| `capacity`       | Business Domain             |
| `scheduling`     | Business Domain             |
| `allocation`     | Business Domain             |
| `operations`     | Business Domain             |
| `projects`       | Business Domain             |
| `production`     | Business Domain             |
| `collaboration`  | Business Domain (satellite) |
| `assets`         | Business Domain             |
| `review`         | Business Domain             |
| `delivery`       | Business Domain             |
| `billing`        | Business Domain             |
| `crm`            | Business Domain             |
| `services`       | Business Domain             |
| `quotation`      | Business Domain             |
| `contracts`      | Business Domain             |
| `engagement`     | Business Domain             |
| `portfolio`      | Business Domain             |
| `knowledge`      | Business Domain             |
| `application`    | Application Layer           |
| `test-utils`     | Test Support                |

---

## core — Domain Kernel

| Field                          | Value                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Framework-agnostic shared contracts and primitives used across domains.                                                                                 |
| **Responsibilities**           | DDD kernel (CORE-001): `AggregateRoot`, `Entity`, `ValueObject`, `DomainEvent`, `DomainError`, `Identity`, `Specification`, `Clock`, `Guard`, `Result`. |
| **Forbidden responsibilities** | Business rules; Payload/CMS code; UI; concrete storage clients; environment loading.                                                                    |
| **Dependency rules**           | May import nothing. All other layers may depend on core where allowed by the matrix.                                                                    |
| **Lifecycle**                  | Permanent foundation; changes are high-impact and require careful review.                                                                               |
| **Owner**                      | Platform Engineering                                                                                                                                    |

---

## infrastructure — Infrastructure

| Field                          | Value                                                                                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**                    | Platform-level technical capabilities that are not business-domain concerns.                                                                                                                                                   |
| **Responsibilities**           | Payload integration, env/config loading, logging, storage/email/queue/cache/search providers, external APIs, auth providers (adapters), file/object storage, event bus and scheduler implementations, infrastructure adapters. |
| **Forbidden responsibilities** | Business rules; domain aggregates; UI components; owning ubiquitous language of a domain.                                                                                                                                      |
| **Dependency rules**           | May import `core`, `config`. Must not import domain or `ui`.                                                                                                                                                                   |
| **Lifecycle**                  | Permanent foundation; grows with technical integrations authorized by ADRs/epics.                                                                                                                                              |
| **Owner**                      | Platform Engineering                                                                                                                                                                                                           |

---


**BUILD-007:** Infrastructure owns EPIC-202 Workforce PostgreSQL/Drizzle adapters (Worker, Position, Employment, EmploymentContract, ReportingRelationship).

**BUILD-009:** Infrastructure owns EPIC-216 Quotation PostgreSQL/Drizzle adapters (Quote, QuoteVersion, QuoteLine, QuoteApproval).

**BUILD-010:** Infrastructure owns EPIC-217 Contracts PostgreSQL/Drizzle adapters (Contract, ContractVersion, ContractTerm, ContractAmendment).

**BUILD-011:** Infrastructure owns EPIC-220 Knowledge PostgreSQL/Drizzle adapters (KnowledgeCategory, KnowledgeArticle, KnowledgeVersion, KnowledgeReference).

**BUILD-012:** Infrastructure owns EPIC-203 Capacity PostgreSQL/Drizzle adapters (CapacityProfile, Capability, AvailabilityProfile, WorkingPattern, ResourceCapacity).

**BUILD-013:** Infrastructure owns EPIC-204 Scheduling PostgreSQL/Drizzle adapters (Calendar, Schedule, TimeBlock, Booking, Shift).

**BUILD-014:** Infrastructure owns EPIC-207 Projects PostgreSQL/Drizzle adapters (Project, ProjectPhase, ProjectObjective, ProjectDependency, Deliverable).

**BUILD-015:** Infrastructure owns EPIC-206 Operations PostgreSQL/Drizzle adapters (WorkOrder, WorkSession, WorkMilestone, WorkOutput, WorkIncident).

## config — Platform Configuration

| Field                          | Value                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| **Purpose**                    | Centralize shared tooling and configuration presets.                                       |
| **Responsibilities**           | ESLint, TypeScript, Prettier, Tailwind, Vitest, Commitlint, lint-staged, shared constants. |
| **Forbidden responsibilities** | Runtime business logic; domain code; application-specific secrets.                         |
| **Dependency rules**           | May import nothing (internal packages).                                                    |
| **Lifecycle**                  | Permanent; updated when platform tooling standards change.                                 |
| **Owner**                      | Platform Engineering                                                                       |

---

## ui — Presentation Library

| Field                          | Value                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Single source of truth for reusable interface primitives and components.                           |
| **Responsibilities**           | Foundations, tokens, icons, primitives, components, layouts, hooks, providers, presentation utils. |
| **Forbidden responsibilities** | Domain business rules; direct persistence; infrastructure provider implementations.                |
| **Dependency rules**           | May import `core`, `config`. Must not import domain or `infrastructure`.                           |
| **Lifecycle**                  | Permanent presentation layer; implementations authorized by UI/design workstreams.                 |
| **Owner**                      | Platform Engineering (Design Systems / Web)                                                        |

---

## organization — Business Domain

| Field                          | Value                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| **Purpose**                    | Organization bounded context implementation package.                                  |
| **Responsibilities**           | Organization domain model, services, repositories (ports), events for this context.   |
| **Forbidden responsibilities** | Downstream domain ownership; UI package ownership; infrastructure provider ownership. |
| **Dependency rules**           | May import `core`, `infrastructure`, `config`.                                        |
| **Lifecycle**                  | Active from EPIC-201 onward.                                                          |
| **Owner**                      | Domain team — Organization                                                            |

---

## workforce — Business Domain

| Field                          | Value                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| **Purpose**                    | Workforce bounded context — people, employment, positions, reporting.                           |
| **Responsibilities**           | Domain model and published API for Worker, Position, Employment, contracts, reporting.          |
| **Forbidden responsibilities** | Organization tenancy ownership; identity/auth; allocation engine; capacity/scheduling.          |
| **Dependency rules**           | May import `organization`, `core`, `infrastructure`, `config`. EPIC-202 uses core+organization. |
| **Lifecycle**                  | Domain model implemented (EPIC-202); adapters deferred.                                         |
| **Owner**                      | Domain team — Workforce                                                                         |

---

## capacity — Business Domain

| Field                          | Value                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Capacity bounded context — resource capability, availability templates, measurable capacity.                           |
| **Responsibilities**           | CapacityProfile, Capability, AvailabilityProfile, WorkingPattern, ResourceCapacity domain API.                         |
| **Forbidden responsibilities** | Schedule construction; assignments; workforce HR ownership.                                                            |
| **Dependency rules**           | May import `workforce`, `organization`, `core`, `infrastructure`, `config`. EPIC-203 uses core+organization+workforce. |
| **Lifecycle**                  | Domain model implemented (EPIC-203); adapters deferred.                                                                |
| **Owner**                      | Domain team — Capacity                                                                                                 |

---

## scheduling — Business Domain

| Field                          | Value                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Scheduling bounded context — temporal planning (when).                                                                                      |
| **Responsibilities**           | Schedule, Calendar, TimeBlock, Booking, Shift domain model and published API.                                                               |
| **Forbidden responsibilities** | Allocation ownership; capacity formula ownership; resource selection.                                                                       |
| **Dependency rules**           | May import `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. EPIC-204 uses core+organization+workforce+capacity. |
| **Lifecycle**                  | Domain model implemented (EPIC-204); adapters deferred.                                                                                     |
| **Owner**                      | Domain team — Scheduling                                                                                                                    |

---

## allocation — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Resource Allocation — commitments between resources and work (EPIC-208).                                                              |
| **Responsibilities**           | Allocation, AllocationGroup, Reservation domain model; conflict detection without capacity math.                                      |
| **Forbidden responsibilities** | Capacity formulas; scheduling; execution; owning projects/work orders; infrastructure; API; UI.                                       |
| **Dependency rules**           | May import `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`.        |
| **Lifecycle**                  | Domain model implemented (EPIC-208); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Allocation                                                                                                              |


## operations — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Operations — execution state of allocated work (work orders, sessions, milestones, outputs, incidents).                               |
| **Responsibilities**           | WorkOrder lifecycle; session non-overlap; milestone uniqueness; output versioning (metadata); incident audit trail.                   |
| **Forbidden responsibilities** | File storage; projects/tasks; owning Allocation/Scheduling/Capacity/Workforce/Organization; infrastructure; API; UI.                  |
| **Dependency rules**           | May import `allocation`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. EPIC-206 uses core + org + workforce + capacity + scheduling + allocation. |
| **Lifecycle**                  | Domain model implemented (EPIC-206); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Operations                                                                                                              |


---

## projects — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Project Management — coordinate business initiatives, phases, deliverables, dependencies, objectives.                                 |
| **Responsibilities**           | Project lifecycle; phase sequencing; deliverable WorkOrder refs; dependency acyclicity; objective progress.                           |
| **Forbidden responsibilities** | Tasks; execution ownership; scheduling/allocation; billing; CRM; infrastructure; API; UI.                                             |
| **Dependency rules**           | May import `operations`, `allocation`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. EPIC-207 uses core + org + workforce + capacity + scheduling + allocation + operations. |
| **Lifecycle**                  | Domain model implemented (EPIC-207); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Projects                                                                                                                |


---

## production — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Production Management — creative production execution lifecycle (EPIC-209).                                                           |
| **Responsibilities**           | Production, sessions, milestones, revisions domain model.                                                                             |
| **Forbidden responsibilities** | Projects/work orders ownership; scheduling; allocation; assets; finance; infrastructure; API; UI.                                     |
| **Dependency rules**           | May import `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-209); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Production                                                                                                              |


---

## review — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Review & Approval — formal reviews, approvals, sessions, decisions (EPIC-211).                                                        |
| **Responsibilities**           | Review, Approval, ReviewSession, ReviewDecision domain model.                                                                         |
| **Forbidden responsibilities** | Files; production ownership; comments; delivery; notifications; infrastructure; API; UI.                                              |
| **Dependency rules**           | May import `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-211); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Review                                                                                                                  |


---

## delivery — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Delivery Management — official delivery state of approved work (EPIC-212).                                                            |
| **Responsibilities**           | Delivery, DeliveryPackage, DeliveryItem, DeliveryReceipt domain model.                                                                |
| **Forbidden responsibilities** | Storage; transfer; downloads; invoices; notifications; infrastructure; API; UI.                                                       |
| **Dependency rules**           | May import `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-212); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Delivery                                                                                                                |

---

## billing — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Billing & Invoicing — commercial lifecycle after delivery (EPIC-213).                                                                 |
| **Responsibilities**           | Invoice, InvoiceLine, Payment (business record), CreditNote domain model.                                                             |
| **Forbidden responsibilities** | Payment gateways; banking; tax filing; PDF/email; bookkeeping; ERP; infrastructure; API; UI.                                          |
| **Dependency rules**           | May import `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-213); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Billing                                                                                                                 |

---

## crm — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | CRM — customer, contact, opportunity, and interaction lifecycles (EPIC-214).                                                          |
| **Responsibilities**           | Customer, Contact, Opportunity, Interaction domain model.                                                                             |
| **Forbidden responsibilities** | Invoicing; project/production execution; email; external CRM sync; marketing; documents; auth; infrastructure; API; UI.               |
| **Dependency rules**           | May import `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-214); adapters deferred.                                                                               |
| **Owner**                      | Domain team — CRM                                                                                                                     |

---

## services — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Services & Pricing — commercial catalogue and standard pricing (EPIC-215).                                                            |
| **Responsibilities**           | Service, ServiceCategory, PriceBook, PriceRule domain model.                                                                          |
| **Forbidden responsibilities** | Quotes; invoices; tax; payments; subscriptions; project/production execution; infrastructure; API; UI.                                |
| **Dependency rules**           | May import `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-215); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Services                                                                                                                |

---

## quotation — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Quotation Management — commercial proposals and customer response (EPIC-216).                                                         |
| **Responsibilities**           | Quote, QuoteVersion, QuoteLine, QuoteApproval domain model.                                                                           |
| **Forbidden responsibilities** | Project creation; invoicing; tax; payments; allocation; production; PDF/email; infrastructure; API; UI.                               |
| **Dependency rules**           | May import `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-216); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Quotation                                                                                                               |

---

## contracts — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Contract Management — agreements, terms, versions, amendments (EPIC-217).                                                             |
| **Responsibilities**           | Contract, ContractVersion, ContractTerm, ContractAmendment domain model.                                                              |
| **Forbidden responsibilities** | PDF/signatures; project creation; invoicing; payments; production; scheduling; email; legal engines; infrastructure; API; UI.         |
| **Dependency rules**           | May import `quotation`, `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-217); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Contracts                                                                                                               |

---

## engagement — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Engagement Management — contractual execution of active contracts (EPIC-218).                                                         |
| **Responsibilities**           | Engagement, Deliverable, Milestone, Obligation domain model.                                                                          |
| **Forbidden responsibilities** | Work orders; scheduling; allocation; production; review; delivery; invoicing; infrastructure; API; UI.                                |
| **Dependency rules**           | May import `contracts`, `quotation`, `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-218); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Engagement                                                                                                              |

---

## portfolio — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Portfolio Management — strategic portfolios, programs, initiatives, governance milestones (EPIC-219).                                 |
| **Responsibilities**           | Portfolio, Program, Initiative, PortfolioMilestone domain model.                                                                      |
| **Forbidden responsibilities** | Project execution; work orders; allocation; scheduling; production; finances; reporting calc; documents; infrastructure; API; UI.     |
| **Dependency rules**           | May import `engagement`, `contracts`, `quotation`, `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-219); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Portfolio                                                                                                               |

---

## knowledge — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Knowledge Management — organizational knowledge identity, lifecycle, taxonomy, governance (EPIC-220).                                 |
| **Responsibilities**           | KnowledgeArticle, KnowledgeVersion, KnowledgeCategory, KnowledgeReference domain model.                                               |
| **Forbidden responsibilities** | File storage; binary documents; search; document generation; websites; permissions; notifications; AI; infrastructure; API; UI.       |
| **Dependency rules**           | May import `portfolio`, `engagement`, `contracts`, `quotation`, `services`, `crm`, `billing`, `delivery`, `review`, `assets`, `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-220); adapters deferred.                                                                               |
| **Owner**                      | Domain team — Knowledge                                                                                                               |

---


---

## application — Application Layer

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Application Layer Foundation — use-case orchestration across domain packages (BUILD-001).                                             |
| **Responsibilities**           | Commands, queries, handlers, DTOs, mappers, validation pipelines; authorization/UoW/event ports.                                      |
| **Forbidden responsibilities** | Domain business rules; persistence implementations; HTTP/UI; Payload collections; database models; RBAC engines.                      |
| **Dependency rules**           | May import all domain packages, `core`, `infrastructure`, `config`. Must not be imported by domain packages.                          |
| **Lifecycle**                  | Implemented (BUILD-001); infrastructure adapters wire ports later.                                                                    |
| **Owner**                      | Platform Engineering — Application Layer                                                                                              |

## collaboration — Business Domain (satellite)

| Field                          | Value                                                                       |
| ------------------------------ | --------------------------------------------------------------------------- |
| **Purpose**                    | Collaboration bounded context (satellite).                                  |
| **Responsibilities**           | Collaboration domain surface within organization scope.                     |
| **Forbidden responsibilities** | Joining primary planning chain without ADR; reverse deps into Organization. |
| **Dependency rules**           | May import `core`, `organization`.                                          |
| **Lifecycle**                  | Scaffold until authorizing epic.                                            |
| **Owner**                      | Domain team — Collaboration                                                 |

---

## assets — Business Domain

| Field                          | Value                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                    | Asset Management — identity, versioning, collections, relationships of creative assets (EPIC-210).                                    |
| **Responsibilities**           | Asset, AssetVersion, AssetCollection, AssetRelationship domain model.                                                                 |
| **Forbidden responsibilities** | File storage/paths/binaries; delivery; permissions; infrastructure; API; UI.                                                          |
| **Dependency rules**           | May import `production`, `allocation`, `projects`, `operations`, `scheduling`, `capacity`, `workforce`, `organization`, `core`, `infrastructure`, `config`. |
| **Lifecycle**                  | Domain model implemented (EPIC-210); storage adapters deferred.                                                                       |
| **Owner**                      | Domain team — Assets                                                                                                                  |


## test-utils — Test Support

| Field                          | Value                                                                     |
| ------------------------------ | ------------------------------------------------------------------------- |
| **Purpose**                    | Shared test helpers for packages and apps.                                |
| **Responsibilities**           | Test fixtures, factories, and harness utilities (when implemented).       |
| **Forbidden responsibilities** | Production runtime use as a domain dependency; business rules.            |
| **Dependency rules**           | May import nothing by default; other packages may depend on it for tests. |
| **Lifecycle**                  | Permanent support package.                                                |
| **Owner**                      | Platform Engineering                                                      |

---

## Applications (not packages, for completeness)

| Application | Classification                |
| ----------- | ----------------------------- |
| `apps/web`  | Deployable presentation host  |
| `apps/cms`  | Deployable CMS host (Payload) |

Applications compose packages; they are not classified as domain packages.

---

## Related

- [Domain Map](./domain-map.md)
- [Package Dependency Matrix](../standards/package-dependencies.md)
- [ADR-008](../adr/ADR-008-package-boundaries.md)
