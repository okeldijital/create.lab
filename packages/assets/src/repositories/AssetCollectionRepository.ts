import type { OrganizationId } from "@creative-lab/organization";
import type { AssetCollection } from "../aggregates/AssetCollection/AssetCollection.js";
import type { AssetCollectionId } from "../types/ids.js";

export interface AssetCollectionRepository {
  findById(id: AssetCollectionId): Promise<AssetCollection | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<AssetCollection[]>;
  save(collection: AssetCollection): Promise<void>;
  update(collection: AssetCollection): Promise<void>;
  archive(id: AssetCollectionId): Promise<void>;
}
