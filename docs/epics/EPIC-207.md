# EPIC-207 — Project Management

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | EPIC-207 Project Management    |
| Document Identifier | EPIC-207                       |
| Version             | 1.0.0                          |
| Status              | Implemented (domain model)     |
| Last Updated        | 2026-08-06                     |
| Supersedes          | BUILD-000 placeholder          |
| Owner               | Product & Platform Engineering |
| Approved By         | EPIC-207                       |
| Effective Date      | 2026-08-06                     |

---

## Status

**Domain model implemented** in `@creative-lab/projects`.

Out of scope: tasks, kanban, time tracking, Gantt, scheduling, allocation, billing,
CRM, notifications, reporting, analytics, assets, infrastructure, database, API, UI, Payload CMS.

## Objective

Coordinate **business initiatives** that provide strategic structure for planning
and execution domains. Projects answer why work exists, how it groups, objectives,
phases, deliverables, dependencies, and progress — without owning execution.

## Scope

### In scope

Project, ProjectPhase, Deliverable, ProjectDependency, ProjectObjective; policies;
services; unit tests; documentation.

### Out of scope

Execution (Operations), resource assignment, scheduling math, tasks.

## Architecture

- Package: `packages/projects`
- Depends on: core, organization, workforce, capacity, scheduling, allocation, operations
- Separation: Operations = what happened; Projects = why / how initiative is structured

## Domain model

### Project (root)

Status: CREATED → PLANNING → ACTIVE ↔ ON_HOLD → COMPLETED | CANCELLED → CLOSED.

Rules: one owner; name unique per organization; closed immutable; actualEnd ≥ startDate.

### ProjectPhase

Sequence unique; no gaps; one ACTIVE; ordered start; completed immutable.

### Deliverable

Name unique per project; references WorkOrder IDs; completed (DELIVERED) immutable.

### ProjectDependency

No self edges; no cycles; historical retention.

### ProjectObjective

Unique names; progress 0–100%; immutable after ACHIEVED/FAILED.

## Repositories

Ports only: Project, ProjectPhase, Deliverable, ProjectDependency, ProjectObjective.

## Services

ProjectService, PhaseService, DeliverableService, DependencyService, ObjectiveService.

## Policies

ProjectLifecyclePolicy, PhasePolicy, DeliverablePolicy, DependencyPolicy, ObjectivePolicy.

## Events

ProjectCreated, ProjectStarted, ProjectCompleted, ProjectClosed, PhaseStarted,
PhaseCompleted, DeliverableCreated, DeliverableCompleted, ObjectiveAchieved,
DependencyCreated.

## Acceptance criteria

- [x] Five aggregates implemented
- [x] Lifecycle fully modelled
- [x] Deterministic phase sequencing; single active phase
- [x] Deliverables reference WorkOrders only
- [x] Dependency cycle prevention
- [x] Objectives with measurable progress
- [x] Immutable VOs; repository ports; services; policies; errors; versioned events
- [x] Documentation complete
- [x] Approved upstream imports only
- [x] Tests and build pass
