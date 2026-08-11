import {
  DeliveryPackage,
  type CreateDeliveryPackageProps,
} from "../aggregates/DeliveryPackage/DeliveryPackage.js";
import {
  DeliveryNotFoundError,
  PackageNotFoundError,
} from "../errors/DeliveryErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { DeliveryLifecyclePolicy } from "../policies/DeliveryLifecyclePolicy.js";
import { PackagePolicy } from "../policies/PackagePolicy.js";
import type { DeliveryPackageRepository } from "../repositories/DeliveryPackageRepository.js";
import type { DeliveryRepository } from "../repositories/DeliveryRepository.js";
import type {
  DeliveryId,
  DeliveryItemId,
  DeliveryPackageId,
} from "../types/ids.js";

export type PackageServiceDeps = {
  deliveryPackageRepository: DeliveryPackageRepository;
  deliveryRepository: DeliveryRepository;
  eventPublisher: DomainEventPublisher;
};

export class PackageService {
  constructor(private readonly deps: PackageServiceDeps) {}

  async create(props: CreateDeliveryPackageProps): Promise<DeliveryPackage> {
    const delivery = await this.deps.deliveryRepository.findById(
      props.deliveryId,
    );
    if (!delivery) throw new DeliveryNotFoundError(props.deliveryId);
    DeliveryLifecyclePolicy.assertMutable(delivery);

    const pkg = DeliveryPackage.create(props);
    delivery.attachPackage(pkg.id);
    await this.deps.deliveryPackageRepository.save(pkg);
    await this.deps.deliveryRepository.update(delivery);
    await this.deps.eventPublisher.publish([
      ...pkg.pullDomainEvents(),
      ...delivery.pullDomainEvents(),
    ]);
    return pkg;
  }

  async rename(
    id: DeliveryPackageId,
    name: string,
    now?: Date,
  ): Promise<DeliveryPackage> {
    const pkg = await this.getById(id);
    PackagePolicy.assertOpen(pkg);
    pkg.rename(name, now);
    await this.deps.deliveryPackageRepository.update(pkg);
    await this.deps.eventPublisher.publish(pkg.pullDomainEvents());
    return pkg;
  }

  async seal(id: DeliveryPackageId, now?: Date): Promise<DeliveryPackage> {
    const pkg = await this.getById(id);
    PackagePolicy.assertCanSeal(pkg);
    pkg.seal(now);
    await this.deps.deliveryPackageRepository.update(pkg);
    await this.deps.eventPublisher.publish(pkg.pullDomainEvents());
    return pkg;
  }

  async archive(
    id: DeliveryPackageId,
    now?: Date,
  ): Promise<DeliveryPackage> {
    const pkg = await this.getById(id);
    pkg.archive(now);
    await this.deps.deliveryPackageRepository.archive(id);
    await this.deps.deliveryPackageRepository.update(pkg);
    await this.deps.eventPublisher.publish(pkg.pullDomainEvents());
    return pkg;
  }

  async addItem(
    id: DeliveryPackageId,
    itemId: DeliveryItemId,
    now?: Date,
  ): Promise<DeliveryPackage> {
    const pkg = await this.getById(id);
    PackagePolicy.assertOpen(pkg);
    pkg.addItem(itemId, now);
    await this.deps.deliveryPackageRepository.update(pkg);
    await this.deps.eventPublisher.publish(pkg.pullDomainEvents());
    return pkg;
  }

  async removeItem(
    id: DeliveryPackageId,
    itemId: DeliveryItemId,
    now?: Date,
  ): Promise<DeliveryPackage> {
    const pkg = await this.getById(id);
    PackagePolicy.assertOpen(pkg);
    pkg.removeItem(itemId, now);
    await this.deps.deliveryPackageRepository.update(pkg);
    await this.deps.eventPublisher.publish(pkg.pullDomainEvents());
    return pkg;
  }

  async getById(id: DeliveryPackageId): Promise<DeliveryPackage> {
    const pkg = await this.deps.deliveryPackageRepository.findById(id);
    if (!pkg) throw new PackageNotFoundError(id);
    return pkg;
  }

  async listByDelivery(deliveryId: DeliveryId): Promise<DeliveryPackage[]> {
    return this.deps.deliveryPackageRepository.findByDelivery(deliveryId);
  }
}
