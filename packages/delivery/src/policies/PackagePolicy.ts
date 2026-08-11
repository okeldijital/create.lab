import type { DeliveryPackage } from "../aggregates/DeliveryPackage/DeliveryPackage.js";
import {
  InvalidDeliveryStateError,
  PackageAlreadySealedError,
} from "../errors/DeliveryErrors.js";

export class PackagePolicy {
  static assertOpen(pkg: DeliveryPackage): void {
    if (pkg.isSealed) {
      throw new PackageAlreadySealedError(pkg.id);
    }
    if (pkg.isArchived) {
      throw new InvalidDeliveryStateError(
        "Archived packages are immutable.",
      );
    }
  }

  static assertCanSeal(pkg: DeliveryPackage): void {
    PackagePolicy.assertOpen(pkg);
    if (pkg.itemIds.length === 0) {
      throw new InvalidDeliveryStateError(
        "Cannot seal package without at least one item.",
      );
    }
  }
}
