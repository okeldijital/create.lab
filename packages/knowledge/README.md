# @creative-lab/knowledge

> Knowledge Management bounded context — **EPIC-220**.

Answers:

- What organizational knowledge exists?
- Which version is current?
- What procedures are approved?
- Which templates are official?
- Which standards are active?
- How is knowledge organized?
- Which knowledge supersedes previous knowledge?

**Terminal business domain** on the primary chain—after Portfolio. No upstream
package may import Knowledge.

## Owns

| Aggregate             | Role                                      |
| --------------------- | ----------------------------------------- |
| `KnowledgeArticle`    | Managed knowledge record lifecycle        |
| `KnowledgeVersion`    | Immutable sequential revisions            |
| `KnowledgeCategory`   | Taxonomy                                  |
| `KnowledgeReference`  | Directed relationships between articles   |

## Does not own

File storage, binary documents, search engines, document generation, website
publishing, permissions, notifications, or AI integration.

## Lifecycles

```
Article:  DRAFT → REVIEW → APPROVED → ACTIVE → RETIRED → ARCHIVED
Version:  DRAFT → APPROVED → CURRENT → SUPERSEDED
Category: ACTIVE → ARCHIVED
```

## Rules (summary)

- Article numbers unique per organization
- Exactly one CURRENT version per article
- Category immutable after article ACTIVE
- Cannot archive category while ACTIVE articles exist
- References: no self-reference, no duplicates
- Retired/archived aggregates immutable (retire → archive only)

## Development

```bash
pnpm --filter @creative-lab/knowledge test
pnpm --filter @creative-lab/knowledge typecheck
pnpm --filter @creative-lab/knowledge build
```
