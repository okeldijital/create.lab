# Engineering Standards

| Field               | Value                       |
| ------------------- | --------------------------- |
| Document Title      | Engineering Standards Index |
| Document Identifier | STD-INDEX                   |
| Version             | BUILD-000A                  |
| Status              | Accepted                    |
| Last Updated        | 2026-08-06                  |
| Supersedes          | None                        |
| Owner               | Platform Engineering        |
| Approved By         | BUILD-000A                  |
| Effective Date      | 2026-08-06                  |

---

Implementation conventions for Creative Lab. Subordinate to the Platform
Constitution and ADRs; superior to ad-hoc implementation choices.

## Core standards

| Standard         | Document                                                   |
| ---------------- | ---------------------------------------------------------- |
| Coding           | [Coding-Standards.md](./Coding-Standards.md)               |
| Naming           | [Naming-Standards.md](./Naming-Standards.md)               |
| Folder structure | [Folder-Structure.md](./Folder-Structure.md)               |
| Repositories     | [Repository-Standards.md](./Repository-Standards.md)       |
| Testing          | [Testing-Standards.md](./Testing-Standards.md)             |
| Documentation    | [Documentation-Standards.md](./Documentation-Standards.md) |
| Events           | [Event-Standards.md](./Event-Standards.md)                 |
| Authorization    | [Authorization-Standards.md](./Authorization-Standards.md) |
| Validation       | [Validation-Standards.md](./Validation-Standards.md)       |
| Payload          | [Payload-Standards.md](./Payload-Standards.md)             |

## Platform architecture standards (BUILD-000A)

| Standard                     | Document                                             |
| ---------------------------- | ---------------------------------------------------- |
| Platform layers & governance | [Platform-Layers.md](./Platform-Layers.md)           |
| Package dependency matrix    | [package-dependencies.md](./package-dependencies.md) |

Related architecture documents (not under `standards/` but mandatory peers):

| Document               | Path                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------- |
| Domain map             | [../architecture/domain-map.md](../architecture/domain-map.md)                         |
| Package classification | [../architecture/package-classification.md](../architecture/package-classification.md) |
| Platform manifest      | [../../platform.manifest.json](../../platform.manifest.json)                           |

## BUILD-000A amendments summary

Engineering Standards now explicitly cover:

- Package classification
- Dependency matrix
- Platform manifest
- Infrastructure layer
- UI package
- Configuration package
- Document metadata
- Governance requirements
- Architecture ownership

See [Platform-Layers.md](./Platform-Layers.md) and
[Documentation-Standards.md](./Documentation-Standards.md).
