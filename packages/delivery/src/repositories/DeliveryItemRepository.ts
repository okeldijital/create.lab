import type { DeliveryItem } from "../aggregates/DeliveryItem/DeliveryItem.js";
import type { DeliveryItemId, DeliveryPackageId } from "../types/ids.js";

export interface DeliveryItemRepository {
  findById(id: DeliveryItemId): Promise<DeliveryItem | null>;
  findByPackage(packageId: DeliveryPackageId): Promise<DeliveryItem[]>;
  save(item: DeliveryItem): Promise<void>;
  update(item: DeliveryItem): Promise<void>;
}
