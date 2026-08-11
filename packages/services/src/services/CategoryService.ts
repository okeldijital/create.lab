import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  ServiceCategory,
  type CreateServiceCategoryProps,
} from "../aggregates/ServiceCategory/ServiceCategory.js";
import {
  CategoryNotFoundError,
} from "../errors/ServicesErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { CategoryPolicy } from "../policies/CategoryPolicy.js";
import type { CategoryRepository } from "../repositories/CategoryRepository.js";
import type { ServiceRepository } from "../repositories/ServiceRepository.js";
import type { ServiceCategoryId } from "../types/ids.js";

export type CategoryServiceDeps = {
  categoryRepository: CategoryRepository;
  serviceRepository: ServiceRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class CategoryService {
  constructor(private readonly deps: CategoryServiceDeps) {}

  async create(props: CreateServiceCategoryProps): Promise<ServiceCategory> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const existing = await this.deps.categoryRepository.findByOrganization(
      props.organizationId,
    );
    CategoryPolicy.assertUniqueName(
      props.organizationId,
      props.name,
      existing,
    );

    const category = ServiceCategory.create(props);
    await this.deps.categoryRepository.save(category);
    await this.deps.eventPublisher.publish(category.pullDomainEvents());
    return category;
  }

  async rename(
    id: ServiceCategoryId,
    name: string,
    now?: Date,
  ): Promise<ServiceCategory> {
    const category = await this.getById(id);
    CategoryPolicy.assertMutable(category);
    const siblings = await this.deps.categoryRepository.findByOrganization(
      category.organizationId,
    );
    CategoryPolicy.assertUniqueName(
      category.organizationId,
      name,
      siblings,
      category.id,
    );
    category.rename(name, now);
    await this.deps.categoryRepository.update(category);
    await this.deps.eventPublisher.publish(category.pullDomainEvents());
    return category;
  }

  async archive(id: ServiceCategoryId, now?: Date): Promise<ServiceCategory> {
    const category = await this.getById(id);
    const services = await this.deps.serviceRepository.findByCategory(id);
    CategoryPolicy.assertCanArchive(category, services);
    category.archive(now);
    await this.deps.categoryRepository.archive(id);
    await this.deps.categoryRepository.update(category);
    await this.deps.eventPublisher.publish(category.pullDomainEvents());
    return category;
  }

  async getById(id: ServiceCategoryId): Promise<ServiceCategory> {
    const category = await this.deps.categoryRepository.findById(id);
    if (!category) throw new CategoryNotFoundError(id);
    return category;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<ServiceCategory[]> {
    return this.deps.categoryRepository.findByOrganization(organizationId);
  }
}
