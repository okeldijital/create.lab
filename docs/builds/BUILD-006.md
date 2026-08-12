# BUILD-006 — CRM Persistence

## Status

**Completed — locally validated.**

## Objective

Introduce PostgreSQL + Drizzle persistence for EPIC-214 `@creative-lab/crm` without changing the CRM domain model or leaking infrastructure concerns into domain/application packages.

## Scope

Persist the four CRM aggregates:

- Customer
- Contact
- Opportunity
- Interaction

Infrastructure owns the Drizzle schema, PostgreSQL migration, mappers, repository adapters, and composition registration.

## Persistence

Migration: `packages/infrastructure/migrations/0002_crm_persistence.sql`

Tables:

- `customers`
- `contacts`
- `opportunities`
- `interactions`

Constraints include organization/customer foreign keys, organization-scoped customer number uniqueness, customer-scoped contact email uniqueness, one primary contact per customer, non-negative opportunity value, and probability bounds.

## Architecture

`@creative-lab/crm` remains domain-only. PostgreSQL, postgres.js, and Drizzle are infrastructure concerns. Repository ports remain interfaces. Composition binds concrete PostgreSQL adapters to the application repository registry.

## Adapters

- `PostgresCustomerRepository`
- `PostgresContactRepository`
- `PostgresOpportunityRepository`
- `PostgresInteractionRepository`

## Composition

`registerPostgresCrmRepositories(composition, database)` registers all four adapters against the supplied Drizzle database instance. Transactional callers must supply the database obtained from `PostgresUnitOfWork.getDatabase()`.

## Validation

Local monorepo gates have been executed and passed. PostgreSQL live integration was unavailable in the validation environment and is reported as such in `reports/build-006-validation.md`.
