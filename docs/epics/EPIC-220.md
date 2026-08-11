# EPIC-220 — Knowledge Management

| Field               | Value                            |
| ------------------- | -------------------------------- |
| Document Title      | EPIC-220 Knowledge Management    |
| Document Identifier | EPIC-220                         |
| Version             | 1.0.0                            |
| Status              | Implemented (domain model)       |
| Last Updated        | 2026-08-07                       |
| Owner               | Product & Platform Engineering   |
| Approved By         | EPIC-220                         |
| Effective Date      | 2026-08-07                       |

---

## Status

**Domain model implemented** in `@creative-lab/knowledge`.

## Objective

Own organizational knowledge identity, lifecycle, taxonomy, and governance.

## Architecture

```
… → portfolio → knowledge
```

Terminal business domain. No upstream package may import Knowledge.

## Owns

KnowledgeArticle, KnowledgeVersion, KnowledgeCategory, KnowledgeReference.

## Out of scope

File storage, binary documents, search engines, document generation, website
publishing, permissions, notifications, AI integration, infrastructure,
persistence adapters, application services beyond pure domain orchestration.

## Acceptance criteria

- [x] Exclusive owner of organizational knowledge governance
- [x] Article numbers unique within organization
- [x] Exactly one CURRENT version per knowledge article
- [x] Categories cannot be archived while ACTIVE articles exist
- [x] Knowledge references valid, directed, no self/duplicates
- [x] Pure domain; dependency matrix intact
- [x] ≥90 unit tests
- [x] Documentation and manifest updated

## Package

`packages/knowledge` → `@creative-lab/knowledge`
