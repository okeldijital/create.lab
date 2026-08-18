# BUILD-011 — Knowledge Persistence

## Status

**Completed — locally validated**

## Scope

BUILD-011 adds PostgreSQL + Drizzle persistence for EPIC-220 Knowledge Management.

### Aggregates

- KnowledgeArticle
- KnowledgeVersion
- KnowledgeCategory
- KnowledgeReference

### Infrastructure

- PostgreSQL/Drizzle schemas under `packages/infrastructure/src/persistence/knowledge`
- Four repository adapters implementing the existing Knowledge repository ports
- Domain/persistence mappers for all four aggregates
- PostgreSQL migration `0007_knowledge_persistence.sql`
- Composition registration via `registerPostgresKnowledgeRepositories`

## Boundary

The dependency direction remains:

`@creative-lab/infrastructure → @creative-lab/knowledge`

The Knowledge domain remains independent of PostgreSQL, Drizzle, and infrastructure.

## Database invariants represented

- Organization-scoped article numbers are unique.
- Organization-scoped category names are unique.
- Article version numbers are unique per article and positive.
- Only one CURRENT version can exist per article at the database level.
- Knowledge references cannot be self-referential.
- Knowledge reference identity is unique by source, target, and relationship type.
- The article/current-version circular foreign-key relationship is deferred until both tables exist.

## Validation

Local validation gates were executed on `build/011-knowledge-persistence`. See `reports/build-011-validation.md` for measured results.
