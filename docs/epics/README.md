# Epic Library

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Document Title      | Epic Library Index             |
| Document Identifier | EPIC-INDEX                     |
| Version             | MVP-001                        |
| Status              | Accepted                       |
| Last Updated        | 2026-10-05                     |
| Supersedes          | BUILD-000A index               |
| Owner               | Product & Platform Engineering |
| Approved By         | Repository state               |
| Effective Date      | 2026-10-05                     |

---

Epic specifications for Creative Lab. GitHub implementation is the authority.
This index records current status; individual epic files may still carry an
older status line until reconciled.

| Epic     | Document                     | Status                                      |
| -------- | ---------------------------- | ------------------------------------------- |
| EPIC-201 | [EPIC-201.md](./EPIC-201.md) | Implemented (domain + persistence)          |
| EPIC-202 | [EPIC-202.md](./EPIC-202.md) | Implemented (domain model)                  |
| EPIC-203 | [EPIC-203.md](./EPIC-203.md) | Implemented (domain model)                  |
| EPIC-204 | [EPIC-204.md](./EPIC-204.md) | Implemented (domain model)                  |
| EPIC-205 | [EPIC-205.md](./EPIC-205.md) | Implemented (domain model)                  |
| EPIC-206 | [EPIC-206.md](./EPIC-206.md) | Specified; not the current MVP boundary     |
| EPIC-207–220 | EPIC-207.md – EPIC-220.md | Domain packages present; product surface not wired |
| EPIC-221 | [EPIC-221.md](./EPIC-221.md) | Implemented (runtime tenant context)        |
| EPIC-222 | [EPIC-222.md](./EPIC-222.md) | In progress (authorization boundary)        |
| AUTH-002 | PR #13 plus `mvp/auth-002-project-list` | Session works on the branch; not merged. Personal workspace is created on first sign-in. |

## Authority

Epics are subordinate to the Platform Constitution and ADRs. Implementation
must not begin until Objective, Scope, and Acceptance Criteria are completed
and consistent with higher authority.

## Required sections

Each epic document contains: Objective, Scope, Architecture, Domain Model,
Repositories, Services, Events, Activity, RBAC, UI, Testing, Acceptance Criteria.

## Current MVP boundary

Do not add another domain package. As of 2026-10-05 the branch
`mvp/auth-002-project-list` (`6b60612`) has session sign-up, sign-in, a
personal workspace, project list, and create. Create-and-open was verified
on 2026-10-05: project Dodo opened with status CREATED. GitHub Actions is not the gate. The next
product path is a created project that can be opened, then the shell session
state, then client intake. `main` and `create.okeldijital.africa` do not have
this slice.
