# Agent Implementation & Deployment Guidelines

These rules apply to implementation agents working in this repository.

## 1. Inspect Before Modifying
- Inspect the existing architecture, project governance, and affected code.
- Identify affected files, services, APIs, databases, and infrastructure.
- Plan the complete change before implementation.

## 2. Implement Coherent Slices
- Group related changes into one coherent implementation slice.
- Do not commit every small change.
- Do not push after every modification.
- Prefer: Inspect → Plan → Implement → Test → Audit → Commit → Push.

## 3. Treat Every Push as an Infrastructure Operation
A Git push may trigger CI, Preview deployments, Production deployments, container builds, artifact creation, and resource consumption.

- Complete and validate coherent work before pushing.
- Do not create deployment storms.
- Do not use remote deployments as an interactive development loop.

## 4. Validate Locally First
Before pushing, run applicable type checks, tests, linting, builds, configuration checks, and diff inspection.

## 5. Audit Before Deployment
For governed changes, use:

Implementation → Testing → Audit → Commit → Push → Deployment → Production Verification

Do not bypass the audit stage merely because the implementation appears correct.

## 6. Control Containers and Artifacts
- Know what artifacts each build creates.
- Check registry, storage, compute, and quota limits before repeated builds.
- Failed or cancelled builds may still create persistent artifacts.
- Clean up obsolete artifacts when appropriate.

## 7. Stop on Infrastructure Failure
If CI, deployment, registry, storage, quota, or infrastructure errors occur:
- Stop repeated execution.
- Diagnose the underlying cause.
- Do not keep pushing in the hope that the next deployment succeeds.
- Determine what resources were created and what must be cleaned up before retrying.

## 8. Make Side Effects Explicit
Agents must report significant infrastructure side effects, including deployment creation, container image creation, database changes, migrations, uploads, and quota consumption.

## 9. Consolidate After Iteration
If multiple experimental attempts were made, consolidate the final state before delivery. Do not turn experimental history into the production delivery mechanism.

## 10. Production Is Intentional
Never use Production as a development loop.

Prefer:

Understand → Implement → Validate → Audit → Deploy → Verify

## 11. Document Lessons
Record important architectural, infrastructure, and operational discoveries in project documentation. Convert recurring failure modes into governance rules.

## Default Agent Behaviour
When uncertain: **Inspect first. Plan second. Implement third. Test fourth. Audit fifth. Commit sixth. Push seventh. Deploy eighth. Verify last.**

Optimize for **correctness + controlled execution + minimal infrastructure churn**, not maximum iteration count.
