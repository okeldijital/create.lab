import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { PriceBook } from "../../aggregates/PriceBook/PriceBook.js";
import type { PriceRule } from "../../aggregates/PriceRule/PriceRule.js";
import type { Service } from "../../aggregates/Service/Service.js";
import type { ServiceCategory } from "../../aggregates/ServiceCategory/ServiceCategory.js";
import type { PriceBookStatus } from "../../enums/PriceBookStatus.js";
import type { ServiceStatus } from "../../enums/ServiceStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { CategoryRepository } from "../../repositories/CategoryRepository.js";
import type { PriceBookRepository } from "../../repositories/PriceBookRepository.js";
import type { PriceRuleRepository } from "../../repositories/PriceRuleRepository.js";
import type { ServiceRepository } from "../../repositories/ServiceRepository.js";
import type {
  PriceBookId,
  PriceRuleId,
  ServiceCategoryId,
  ServiceId,
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

export class InMemoryServiceRepository implements ServiceRepository {
  private readonly byId = new Map<string, Service>();
  async findById(id: ServiceId): Promise<Service | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Service[]> {
    return [...this.byId.values()].filter(
      (s) => s.organizationId === organizationId,
    );
  }
  async findByServiceCode(
    organizationId: OrganizationId,
    serviceCode: string,
  ): Promise<Service | null> {
    return (
      [...this.byId.values()].find(
        (s) =>
          s.organizationId === organizationId &&
          s.serviceCode.value === serviceCode.toUpperCase(),
      ) ?? null
    );
  }
  async findByCategory(categoryId: ServiceCategoryId): Promise<Service[]> {
    return [...this.byId.values()].filter((s) => s.categoryId === categoryId);
  }
  async findByStatus(status: ServiceStatus): Promise<Service[]> {
    return [...this.byId.values()].filter((s) => s.status === status);
  }
  async save(service: Service): Promise<void> {
    this.byId.set(service.id, service);
  }
  async update(service: Service): Promise<void> {
    this.byId.set(service.id, service);
  }
  async archive(id: ServiceId): Promise<void> {
    void id;
  }
  async exists(id: ServiceId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryCategoryRepository implements CategoryRepository {
  private readonly byId = new Map<string, ServiceCategory>();
  async findById(id: ServiceCategoryId): Promise<ServiceCategory | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ServiceCategory[]> {
    return [...this.byId.values()].filter(
      (c) => c.organizationId === organizationId,
    );
  }
  async findByName(
    organizationId: OrganizationId,
    name: string,
  ): Promise<ServiceCategory | null> {
    const n = name.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (c) =>
          c.organizationId === organizationId &&
          c.name.value.toLowerCase() === n,
      ) ?? null
    );
  }
  async save(category: ServiceCategory): Promise<void> {
    this.byId.set(category.id, category);
  }
  async update(category: ServiceCategory): Promise<void> {
    this.byId.set(category.id, category);
  }
  async archive(id: ServiceCategoryId): Promise<void> {
    void id;
  }
  async exists(id: ServiceCategoryId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryPriceBookRepository implements PriceBookRepository {
  private readonly byId = new Map<string, PriceBook>();
  async findById(id: PriceBookId): Promise<PriceBook | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<PriceBook[]> {
    return [...this.byId.values()].filter(
      (b) => b.organizationId === organizationId,
    );
  }
  async findByStatus(status: PriceBookStatus): Promise<PriceBook[]> {
    return [...this.byId.values()].filter((b) => b.status === status);
  }
  async findPublished(organizationId: OrganizationId): Promise<PriceBook[]> {
    return [...this.byId.values()].filter(
      (b) => b.organizationId === organizationId && b.isPublished,
    );
  }
  async findByCurrency(
    organizationId: OrganizationId,
    currency: string,
  ): Promise<PriceBook[]> {
    const code = currency.toUpperCase();
    return [...this.byId.values()].filter(
      (b) =>
        b.organizationId === organizationId && b.currency.code === code,
    );
  }
  async save(priceBook: PriceBook): Promise<void> {
    this.byId.set(priceBook.id, priceBook);
  }
  async update(priceBook: PriceBook): Promise<void> {
    this.byId.set(priceBook.id, priceBook);
  }
  async archive(id: PriceBookId): Promise<void> {
    void id;
  }
  async exists(id: PriceBookId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryPriceRuleRepository implements PriceRuleRepository {
  private readonly byId = new Map<string, PriceRule>();
  async findById(id: PriceRuleId): Promise<PriceRule | null> {
    return this.byId.get(id) ?? null;
  }
  async findByPriceBook(priceBookId: PriceBookId): Promise<PriceRule[]> {
    return [...this.byId.values()].filter(
      (r) => r.priceBookId === priceBookId,
    );
  }
  async findByService(serviceId: ServiceId): Promise<PriceRule[]> {
    return [...this.byId.values()].filter((r) => r.serviceId === serviceId);
  }
  async findActiveByServiceAndBook(
    serviceId: ServiceId,
    priceBookId: PriceBookId,
  ): Promise<PriceRule | null> {
    return (
      [...this.byId.values()].find(
        (r) =>
          r.serviceId === serviceId &&
          r.priceBookId === priceBookId &&
          r.isActive,
      ) ?? null
    );
  }
  async save(rule: PriceRule): Promise<void> {
    this.byId.set(rule.id, rule);
  }
  async update(rule: PriceRule): Promise<void> {
    this.byId.set(rule.id, rule);
  }
  async archive(id: PriceRuleId): Promise<void> {
    void id;
  }
  async exists(id: PriceRuleId): Promise<boolean> {
    return this.byId.has(id);
  }
}
