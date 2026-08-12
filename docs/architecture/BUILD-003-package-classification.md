# BUILD-003 Package Classification Addendum

| Package | Classification | Allowed dependencies |
|---|---|---|
| `@creative-lab/composition` | Integration / Composition Root | `@creative-lab/application`, `@creative-lab/infrastructure` |

## Rule

`@creative-lab/composition` is an outer-layer assembly package. It may depend on application contracts and concrete infrastructure adapters. No domain package, application package, or infrastructure package may depend on composition.

## Rationale

The composition root must be able to construct the runtime graph without forcing the application layer to know concrete infrastructure implementations. This preserves dependency inversion while giving future presentation layers a single runtime assembly boundary.
