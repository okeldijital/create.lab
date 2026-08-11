# Coding Standards

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| Document Title      | Coding Standards                             |
| Document Identifier | STD-CODING-STANDARDS                         |
| Version             | BUILD-000                                    |
| Status              | Accepted                                     |
| Last Updated        | 2026-08-06                                   |
| Supersedes          | None                                         |
| Owner               | Platform Engineering                         |
| Approved By         | BUILD-000 (metadata standardized BUILD-000A) |
| Effective Date      | 2026-08-06                                   |

---

## Authority

Platform Constitution Title III Article 11. Supplements ADRs without replacing them.

## Language and toolchain

- TypeScript is the default language for packages and applications.
- `strict` compiler options are required (see `tsconfig.base.json`).
- ESLint and Prettier are mandatory; CI fails on violations.

## Style

1. Prefer explicit types on exported public APIs.
2. Prefer `type` imports for types (`consistent-type-imports`).
3. Avoid `any`; use `unknown` and narrow.
4. Prefer pure functions where side effects are unnecessary.
5. Keep modules cohesive; one primary reason to change per file when practical.
6. Do not leave dead code, commented-out blocks, or TODO without owner/issue.

## Structure of code

1. Domain rules do not import UI frameworks or CMS framework internals.
2. Side-effecting I/O is pushed to adapters (repositories, gateways, CMS hooks).
3. Fail fast on invariant violations with typed errors (when implemented).
4. **Domain Kernel (`@creative-lab/core`)** is the sole source of DDD primitives:
   - Aggregates extend `AggregateRoot<TId>`
   - Value objects extend `ValueObject<TProps>`
   - Domain events extend `DomainEvent`
   - Domain errors extend `DomainError`
   - Do not re-implement `Entity`, `Identity`, `Specification`, `Clock`, `Guard`, or `Result` in domain packages (CORE-001)

## Exports

1. Package public API is the package `src/index.ts` (and documented subpaths if added).
2. Internal modules are not imported across package boundaries.
3. Accidental exports are defects.

## Comments

1. Comments explain why, not what is obvious from code.
2. Public abstractions warrant brief documentation comments.

## Forbidden in foundation packages until authorized by epic

- Business workflows, entity persistence, and UI features.
- Speculative abstractions not required by an accepted ADR or epic.
