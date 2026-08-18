# BUILD-003 Dependency Matrix Addendum

## New package

`composition` is registered with the following permitted workspace dependencies:

```text
composition → application
composition → infrastructure
```

## Forbidden reverse edges

```text
domain → composition        FORBIDDEN
application → composition   FORBIDDEN
infrastructure → composition FORBIDDEN
```

The composition root is therefore an outer assembly boundary. It may consume the application contracts and infrastructure implementations but is not a dependency of either layer.

The machine-enforced dependency matrix is updated in `scripts/check-deps.mjs` for this build.
