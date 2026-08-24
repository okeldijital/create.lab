# SPRINT-223.3 — Project Vertical Slice

## Objective
Promote the project read path from an application shell to a real authenticated PostgreSQL-backed vertical slice.

## Delivered
- `GetProjectHandler` now requires `project.read` authorization and verifies the returned project's organization matches the request context.
- Web application runtime composes `PostgresProjectRepository` and registers `GetProjectHandler`.
- Added `getProject()` runtime helper using `getProjectQuery()`.
- Added `/projects/[projectId]` authenticated project read surface.

## Gate
Vercel production deployment on `main` remains the authoritative pass gate.

## Remaining verification
- Production read against a real project record.
- Unauthorized actor rejection.
- Cross-tenant project rejection.
