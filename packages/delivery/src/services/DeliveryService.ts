import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import type { ReviewId } from "@creative-lab/review";
import {
  Delivery,
  type CreateDeliveryProps,
} from "../aggregates/Delivery/Delivery.js";
import { DeliveryStatus } from "../enums/DeliveryStatus.js";
import { DeliveryNotFoundError } from "../errors/DeliveryErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { DeliveryLifecyclePolicy } from "../policies/DeliveryLifecyclePolicy.js";
import type { DeliveryRepository } from "../repositories/DeliveryRepository.js";
import type { DeliveryId } from "../types/ids.js";
import { DeliveryReference } from "../value-objects/DeliveryReference.js";

export type DeliveryServiceDeps = {
  deliveryRepository: DeliveryRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class DeliveryService {
  constructor(private readonly deps: DeliveryServiceDeps) {}

  async create(props: CreateDeliveryProps): Promise<Delivery> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const delivery = Delivery.create({
      ...props,
      referenceNumber:
        props.referenceNumber ?? DeliveryReference.generate().value,
    });
    await this.deps.deliveryRepository.save(delivery);
    await this.deps.eventPublisher.publish(delivery.pullDomainEvents());
    return delivery;
  }

  async markReady(id: DeliveryId, now?: Date): Promise<Delivery> {
    const delivery = await this.getById(id);
    DeliveryLifecyclePolicy.assertCanTransition(
      delivery,
      DeliveryStatus.READY,
    );
    delivery.markReady(now);
    await this.deps.deliveryRepository.update(delivery);
    await this.deps.eventPublisher.publish(delivery.pullDomainEvents());
    return delivery;
  }

  async deliver(id: DeliveryId, now?: Date): Promise<Delivery> {
    const delivery = await this.getById(id);
    DeliveryLifecyclePolicy.assertCanDeliver(delivery);
    delivery.deliver(now);
    await this.deps.deliveryRepository.update(delivery);
    await this.deps.eventPublisher.publish(delivery.pullDomainEvents());
    return delivery;
  }

  async confirm(id: DeliveryId, now?: Date): Promise<Delivery> {
    const delivery = await this.getById(id);
    DeliveryLifecyclePolicy.assertCanConfirm(delivery);
    delivery.confirm(now);
    await this.deps.deliveryRepository.update(delivery);
    await this.deps.eventPublisher.publish(delivery.pullDomainEvents());
    return delivery;
  }

  async archive(id: DeliveryId, now?: Date): Promise<Delivery> {
    const delivery = await this.getById(id);
    DeliveryLifecyclePolicy.assertCanTransition(
      delivery,
      DeliveryStatus.ARCHIVED,
    );
    delivery.archive(now);
    await this.deps.deliveryRepository.archive(id);
    await this.deps.deliveryRepository.update(delivery);
    await this.deps.eventPublisher.publish(delivery.pullDomainEvents());
    return delivery;
  }

  async getById(id: DeliveryId): Promise<Delivery> {
    const delivery = await this.deps.deliveryRepository.findById(id);
    if (!delivery) throw new DeliveryNotFoundError(id);
    return delivery;
  }

  async findByReference(referenceNumber: string): Promise<Delivery | null> {
    return this.deps.deliveryRepository.findByReference(referenceNumber);
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Delivery[]> {
    return this.deps.deliveryRepository.findByOrganization(organizationId);
  }

  async listByProject(projectId: ProjectId): Promise<Delivery[]> {
    return this.deps.deliveryRepository.findByProject(projectId);
  }

  async listByProduction(productionId: ProductionId): Promise<Delivery[]> {
    return this.deps.deliveryRepository.findByProduction(productionId);
  }

  async listByReview(reviewId: ReviewId): Promise<Delivery[]> {
    return this.deps.deliveryRepository.findByReview(reviewId);
  }
}
