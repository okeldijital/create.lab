import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import type { ReviewId } from "@creative-lab/review";
import type { Delivery } from "../../aggregates/Delivery/Delivery.js";
import type { DeliveryItem } from "../../aggregates/DeliveryItem/DeliveryItem.js";
import type { DeliveryPackage } from "../../aggregates/DeliveryPackage/DeliveryPackage.js";
import type { DeliveryReceipt } from "../../aggregates/DeliveryReceipt/DeliveryReceipt.js";
import type { DeliveryStatus } from "../../enums/DeliveryStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { DeliveryItemRepository } from "../../repositories/DeliveryItemRepository.js";
import type { DeliveryPackageRepository } from "../../repositories/DeliveryPackageRepository.js";
import type { DeliveryReceiptRepository } from "../../repositories/DeliveryReceiptRepository.js";
import type { DeliveryRepository } from "../../repositories/DeliveryRepository.js";
import type {
  DeliveryId,
  DeliveryItemId,
  DeliveryPackageId,
  DeliveryReceiptId,
} from "../../types/ids.js";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: AnyDomainEvent[] = [];
  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.events.push(...events);
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly byId = new Map<string, Organization>();
  async findById(id: OrganizationId): Promise<Organization | null> {
    return this.byId.get(id) ?? null;
  }
  async findBySlug(
    slug: OrganizationSlug | string,
  ): Promise<Organization | null> {
    const v = typeof slug === "string" ? slug : slug.value;
    for (const o of this.byId.values()) {
      if (o.slug.value === v) return o;
    }
    return null;
  }
  async findAll(): Promise<Organization[]> {
    return [...this.byId.values()];
  }
  async save(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: OrganizationId): Promise<void> {
    void id;
  }
  async exists(id: OrganizationId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsBySlug(slug: OrganizationSlug | string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }
  async delete(id: OrganizationId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryDeliveryRepository implements DeliveryRepository {
  private readonly byId = new Map<string, Delivery>();

  async findById(id: DeliveryId): Promise<Delivery | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Delivery[]> {
    return [...this.byId.values()].filter(
      (d) => d.organizationId === organizationId,
    );
  }
  async findByProject(projectId: ProjectId): Promise<Delivery[]> {
    return [...this.byId.values()].filter((d) => d.projectId === projectId);
  }
  async findByProduction(productionId: ProductionId): Promise<Delivery[]> {
    return [...this.byId.values()].filter(
      (d) => d.productionId === productionId,
    );
  }
  async findByReview(reviewId: ReviewId): Promise<Delivery[]> {
    return [...this.byId.values()].filter((d) => d.reviewId === reviewId);
  }
  async findByReference(referenceNumber: string): Promise<Delivery | null> {
    return (
      [...this.byId.values()].find(
        (d) => d.referenceNumber.value === referenceNumber,
      ) ?? null
    );
  }
  async findByStatus(status: DeliveryStatus): Promise<Delivery[]> {
    return [...this.byId.values()].filter((d) => d.status === status);
  }
  async save(d: Delivery): Promise<void> {
    this.byId.set(d.id, d);
  }
  async update(d: Delivery): Promise<void> {
    this.byId.set(d.id, d);
  }
  async archive(id: DeliveryId): Promise<void> {
    void id;
  }
  async exists(id: DeliveryId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryDeliveryPackageRepository
  implements DeliveryPackageRepository
{
  private readonly byId = new Map<string, DeliveryPackage>();

  async findById(id: DeliveryPackageId): Promise<DeliveryPackage | null> {
    return this.byId.get(id) ?? null;
  }
  async findByDelivery(deliveryId: DeliveryId): Promise<DeliveryPackage[]> {
    return [...this.byId.values()].filter((p) => p.deliveryId === deliveryId);
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<DeliveryPackage[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId,
    );
  }
  async save(p: DeliveryPackage): Promise<void> {
    this.byId.set(p.id, p);
  }
  async update(p: DeliveryPackage): Promise<void> {
    this.byId.set(p.id, p);
  }
  async archive(id: DeliveryPackageId): Promise<void> {
    void id;
  }
}

export class InMemoryDeliveryItemRepository
  implements DeliveryItemRepository
{
  private readonly byId = new Map<string, DeliveryItem>();

  async findById(id: DeliveryItemId): Promise<DeliveryItem | null> {
    return this.byId.get(id) ?? null;
  }
  async findByPackage(packageId: DeliveryPackageId): Promise<DeliveryItem[]> {
    return [...this.byId.values()].filter((i) => i.packageId === packageId);
  }
  async save(i: DeliveryItem): Promise<void> {
    this.byId.set(i.id, i);
  }
  async update(i: DeliveryItem): Promise<void> {
    this.byId.set(i.id, i);
  }
}

export class InMemoryDeliveryReceiptRepository
  implements DeliveryReceiptRepository
{
  private readonly byId = new Map<string, DeliveryReceipt>();

  async findById(id: DeliveryReceiptId): Promise<DeliveryReceipt | null> {
    return this.byId.get(id) ?? null;
  }
  async findByDelivery(deliveryId: DeliveryId): Promise<DeliveryReceipt[]> {
    return [...this.byId.values()].filter((r) => r.deliveryId === deliveryId);
  }
  async findByRecipient(
    deliveryId: DeliveryId,
    recipientId: string,
  ): Promise<DeliveryReceipt | null> {
    return (
      [...this.byId.values()].find(
        (r) =>
          r.deliveryId === deliveryId && r.recipientId === recipientId,
      ) ?? null
    );
  }
  async save(r: DeliveryReceipt): Promise<void> {
    this.byId.set(r.id, r);
  }
  async update(r: DeliveryReceipt): Promise<void> {
    this.byId.set(r.id, r);
  }
}
