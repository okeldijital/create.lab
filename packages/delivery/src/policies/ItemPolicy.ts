import type { DeliveryItem } from "../aggregates/DeliveryItem/DeliveryItem.js";
import { DuplicateDeliveryItemError } from "../errors/DeliveryErrors.js";
import type { AssetVersionId } from "@creative-lab/assets";
import type { DeliveryPackageId } from "../types/ids.js";

export class ItemPolicy {
  static assertUniqueAssetVersion(
    existing: readonly DeliveryItem[],
    packageId: DeliveryPackageId,
    assetVersionId: AssetVersionId,
  ): void {
    const dup = existing.find(
      (i) =>
        i.isActive &&
        i.packageId === packageId &&
        i.assetVersionId === assetVersionId,
    );
    if (dup) {
      throw new DuplicateDeliveryItemError(
        `Asset version "${assetVersionId}" is already in package "${packageId}".`,
      );
    }
  }

  static assertNoDuplicateItem(
    existing: readonly DeliveryItem[],
    itemId: string,
  ): void {
    if (existing.some((i) => i.id === itemId && i.isActive)) {
      throw new DuplicateDeliveryItemError(
        `Item "${itemId}" already exists.`,
      );
    }
  }
}
