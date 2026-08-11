import type { AssetRelationship } from "../aggregates/AssetRelationship/AssetRelationship.js";
import type { AssetId, AssetRelationshipId } from "../types/ids.js";

export interface AssetRelationshipRepository {
  findById(id: AssetRelationshipId): Promise<AssetRelationship | null>;
  findBySource(sourceAssetId: AssetId): Promise<AssetRelationship[]>;
  findByTarget(targetAssetId: AssetId): Promise<AssetRelationship[]>;
  save(relationship: AssetRelationship): Promise<void>;
  remove(id: AssetRelationshipId): Promise<void>;
}
