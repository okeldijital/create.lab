import type { OrganizationId } from "@creative-lab/organization";
import type { DeliveryPackage } from "../aggregates/DeliveryPackage/DeliveryPackage.js";
import type { DeliveryId, DeliveryPackageId } from "../types/ids.js";

export interface DeliveryPackageRepository {
  findById(id: DeliveryPackageId): Promise<DeliveryPackage | null>;
  findByDelivery(deliveryId: DeliveryId): Promise<DeliveryPackage[]>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<DeliveryPackage[]>;
  save(pkg: DeliveryPackage): Promise<void>;
  update(pkg: DeliveryPackage): Promise<void>;
  archive(id: DeliveryPackageId): Promise<void>;
}
