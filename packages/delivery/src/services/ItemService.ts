import type { AssetId, AssetVersionId } from "@creative-lab/assets";
import {
  DeliveryItem,
  type CreateDeliveryItemProps,
} from "../aggregates/DeliveryItem/DeliveryItem.js";
import {
  ItemNotFoundError,
  PackageNotFoundError,
} from "../errors/DeliveryErrors.js";
import { ItemRemoved } from "../events/delivery-events.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ItemPolicy } from "../policies/ItemPolicy.js";
import { PackagePolicy } from "../policies/PackagePolicy.js";
import type { DeliveryItemRepository } from "../repositories/DeliveryItemRepository.js";
import type { DeliveryPackageRepository } from "../repositories/DeliveryPackageRepository.js";
import type { DeliveryItemId, DeliveryPackageId } from "../types/ids.js";

export type ItemServiceDeps = {
  deliveryItemRepository: DeliveryItemRepository;
  deliveryPackageRepository: DeliveryPackageRepository;
  eventPublisher: DomainEventPublisher;
};

export type CreateItemForPackageProps = {
  organizationId: CreateDeliveryItemProps["organizationId"];
  packageId: DeliveryPackageId;
  assetId: AssetId;
  assetVersionId: AssetVersionId;
  name: string;
  notes?: string | null;
  now?: Date;
};

export class ItemService {
  constructor(private readonly deps: ItemServiceDeps) {}

  async create(props: CreateItemForPackageProps): Promise<DeliveryItem> {
    const pkg = await this.deps.deliveryPackageRepository.findById(
      props.packageId,
    );
    if (!pkg) throw new PackageNotFoundError(props.packageId);
    PackagePolicy.assertOpen(pkg);

    const existing = await this.deps.deliveryItemRepository.findByPackage(
      props.packageId,
    );
    ItemPolicy.assertUniqueAssetVersion(
      existing,
      props.packageId,
      props.assetVersionId,
    );

    const item = DeliveryItem.create(props);
    pkg.addItem(item.id, props.now);
    await this.deps.deliveryItemRepository.save(item);
    await this.deps.deliveryPackageRepository.update(pkg);
    await this.deps.eventPublisher.publish([
      ...item.pullDomainEvents(),
      ...pkg.pullDomainEvents(),
    ]);
    return item;
  }

  async remove(
    itemId: DeliveryItemId,
    now?: Date,
  ): Promise<DeliveryItem> {
    const item = await this.getById(itemId);
    const pkg = await this.deps.deliveryPackageRepository.findById(
      item.packageId,
    );
    if (!pkg) throw new PackageNotFoundError(item.packageId);
    PackagePolicy.assertOpen(pkg);

    item.markRemoved();
    pkg.removeItem(item.id, now);
    await this.deps.deliveryItemRepository.update(item);
    await this.deps.deliveryPackageRepository.update(pkg);
    await this.deps.eventPublisher.publish([
      ItemRemoved.create({
        organizationId: item.organizationId,
        itemId: item.id,
        packageId: item.packageId,
        occurredAt: now,
      }),
      ...pkg.pullDomainEvents(),
    ]);
    return item;
  }

  async getById(id: DeliveryItemId): Promise<DeliveryItem> {
    const item = await this.deps.deliveryItemRepository.findById(id);
    if (!item) throw new ItemNotFoundError(id);
    return item;
  }

  async listByPackage(
    packageId: DeliveryPackageId,
  ): Promise<DeliveryItem[]> {
    return this.deps.deliveryItemRepository.findByPackage(packageId);
  }
}
