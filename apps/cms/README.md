# @creative-lab/cms

> CMS application scaffolding — BUILD-000.

## Purpose

Content and configuration management host for Creative Lab. **No Payload
collections or CMS configuration** are implemented in BUILD-000.

## Structure

```
apps/cms/
├── collections/   # CMS collection definitions (empty)
├── access/        # Access control helpers (empty)
├── hooks/         # CMS lifecycle hooks (empty)
├── utilities/     # CMS-local utilities (empty)
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Rules

- Collections and access control are deferred to later epics.
- Authority: ADR-007 Payload Integration, Payload-Standards.md.
- Domain logic belongs in `packages/*`.
