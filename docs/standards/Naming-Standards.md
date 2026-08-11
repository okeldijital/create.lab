# Naming Standards

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | Naming Standards                             |
| Document Identifier | STD-NAMING-STANDARDS                         |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Engineering                         |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | 2026-08-06                                   |

---

## Packages and apps

| Kind         | Pattern                                | Example                   |
| ------------ | -------------------------------------- | ------------------------- |
| Package name | `@creative-lab/<context>`              | `@creative-lab/workforce` |
| App name     | `@creative-lab/<app>`                  | `@creative-lab/web`       |
| Directory    | kebab-case matching package short name | `packages/workforce`      |

## TypeScript symbols

| Kind                  | Convention                                              | Example                          |
| --------------------- | ------------------------------------------------------- | -------------------------------- |
| Types / interfaces    | PascalCase                                              | `OrganizationId`                 |
| Classes               | PascalCase                                              | `InMemoryOrganizationRepository` |
| Functions / variables | camelCase                                               | `createSchedule`                 |
| Constants             | SCREAMING_SNAKE or camelCase for exported const objects | `MAX_PAGE_SIZE`                  |
| Files                 | kebab-case or match primary export                      | `organization-repository.ts`     |
| Test files            | `*.test.ts` or `*.spec.ts`                              | `policy.test.ts`                 |

## Domain language

1. Use ubiquitous language from the owning epic/context.
2. Avoid UI terms inside domain packages (`Page`, `Button`, `Form`).
3. Prefer precise verbs for commands and past tense for events
   (`AllocationCreated`).

## Events

- Name: `<Aggregate><PastTenseVerb>` or equivalent domain phrase.
- See Event-Standards.md.

## Authorization

- Roles and permissions use stable string identifiers documented per epic.
- Prefer `organization:<action>` or resource-qualified forms once defined.
