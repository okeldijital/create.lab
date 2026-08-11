import type { AssetVersion } from "../aggregates/AssetVersion/AssetVersion.js";
import type { AssetId, AssetVersionId } from "../types/ids.js";

export interface AssetVersionRepository {
  findById(id: AssetVersionId): Promise<AssetVersion | null>;
  findByAsset(assetId: AssetId): Promise<AssetVersion[]>;
  findCurrent(assetId: AssetId): Promise<AssetVersion | null>;
  save(version: AssetVersion): Promise<void>;
  update(version: AssetVersion): Promise<void>;
}
