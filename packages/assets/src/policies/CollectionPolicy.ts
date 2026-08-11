import type { AssetCollection } from "../aggregates/AssetCollection/AssetCollection.js";
import {
  DuplicateCollectionError,
  InvalidAssetStateError,
} from "../errors/AssetErrors.js";
import type { OrganizationId } from "@creative-lab/organization";
import { CollectionName } from "../value-objects/CollectionName.js";

export class CollectionPolicy {
  static assertUniqueName(
    existing: readonly AssetCollection[],
    name: string,
    organizationId: OrganizationId,
    excludeId?: string,
  ): void {
    const candidate = CollectionName.create(name);
    const dup = existing.find(
      (c) =>
        c.id !== excludeId &&
        c.organizationId === organizationId &&
        !c.archived &&
        c.name.equalsIgnoreCase(candidate),
    );
    if (dup) {
      throw new DuplicateCollectionError(candidate.value, organizationId);
    }
  }

  static assertMutable(collection: AssetCollection): void {
    if (collection.archived) {
      throw new InvalidAssetStateError(
        "Archived collections are immutable.",
      );
    }
  }
}
