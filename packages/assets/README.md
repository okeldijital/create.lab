# @creative-lab/assets

> Asset Management bounded context — **EPIC-210**.

Owns the **lifecycle, identity, classification, versioning, and relationships**
of creative assets.

Answers: *What creative artifacts exist, how are they organized, and which
version is authoritative?*

Does **not** answer storage, delivery, production, review, or distribution.

## Responsibility

- Asset identity and status
- Immutable sequential versions (checksum + metadata only)
- Collections of assets
- Directed relationships between assets

## Owns

| Aggregate            | Role                                              |
| -------------------- | ------------------------------------------------- |
| `Asset`              | Logical creative asset (exactly one current ver.) |
| `AssetVersion`       | Immutable revision (checksum, metadata)           |
| `AssetCollection`    | Named grouping of asset IDs                       |
| `AssetRelationship`  | Directed typed links between assets               |

## Consumes

Opaque refs only: `OrganizationId`, `ProjectId`, `ProductionId`, `CreatedBy`.

## Forbidden

- File paths, binary content, uploads, S3/MinIO
- Delivery / download / permissions
- Production execution, review workflows
- Persistence, UI, API, Payload CMS

## Architecture position

```
… → production → assets
```

No upstream package may import Assets.

## Services

- `AssetService` — create (with v1), rename, archive, restore, create/promote version
- `VersionService` — list, sequential validation, supersede
- `CollectionService` — create/rename/archive/add/remove
- `RelationshipService` — create/remove with duplicate & self checks

## Events

AssetCreated/Updated/Archived/Restored, AssetVersionCreated/Promoted,
CollectionCreated/Archived, AssetAddedToCollection/RemovedFromCollection,
RelationshipCreated/Removed.

## Example

```ts
const { asset, version } = await assetService.create({
  organizationId,
  projectId,
  productionId,
  name: "Master",
  assetType: AssetType.MASTER,
  createdBy: "engineer",
  checksum: "sha256:…",
  metadata: { format: "wav", sampleRate: 48000 },
});

await assetService.createVersion({
  assetId: asset.id,
  checksum: "sha256:…v2",
  createdBy: "engineer",
  promote: true,
});
```

## Development

```bash
pnpm --filter @creative-lab/assets test
pnpm --filter @creative-lab/assets typecheck
pnpm --filter @creative-lab/assets build
```
