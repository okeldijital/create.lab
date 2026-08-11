import type { Asset } from "../aggregates/Asset/Asset.js";
import {
  CurrentVersionError,
  InvalidAssetStateError,
} from "../errors/AssetErrors.js";

export class AssetLifecyclePolicy {
  static assertMutable(asset: Asset): void {
    if (asset.isArchived) {
      throw new InvalidAssetStateError("Archived assets are immutable.");
    }
  }

  static assertHasCurrentVersion(asset: Asset): void {
    if (!asset.currentVersionId) {
      throw new CurrentVersionError(
        "Asset must have exactly one current version.",
      );
    }
  }

  static assertCanRestore(asset: Asset): void {
    if (!asset.isArchived) {
      throw new InvalidAssetStateError(
        "Only archived assets can be restored.",
      );
    }
    AssetLifecyclePolicy.assertHasCurrentVersion(asset);
  }
}
