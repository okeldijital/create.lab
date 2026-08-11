# @creative-lab/web

> Web application scaffolding — BUILD-000.

## Purpose

Host application for Creative Lab end-user experiences. **No UI or domain
implementation** is present in BUILD-000.

## Structure

```
apps/web/
├── app/           # Application routes / entry surfaces
├── components/    # Presentational and composite UI
├── lib/           # App-local utilities and clients
├── actions/       # Server / form actions
├── hooks/         # React hooks
├── styles/        # Global and shared styles
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Rules

- Domain logic belongs in `packages/*`, not in this app.
- The app may compose packages according to the approved dependency graph.
- Authority: Platform Constitution, ADR-008, Folder-Structure.md.
