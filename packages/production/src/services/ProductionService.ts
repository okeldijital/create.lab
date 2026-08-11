import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import type { WorkOrderId } from "@creative-lab/operations";
import type { ProjectId } from "@creative-lab/projects";
import {
  Production,
  type CreateProductionProps,
} from "../aggregates/Production/Production.js";
import { ProductionStatus } from "../enums/ProductionStatus.js";
import { ProductionNotFoundError } from "../errors/ProductionErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ProductionLifecyclePolicy } from "../policies/ProductionLifecyclePolicy.js";
import type { ProductionRepository } from "../repositories/ProductionRepository.js";
import type { ProductionId } from "../types/ids.js";

export type ProductionServiceDeps = {
  productionRepository: ProductionRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class ProductionService {
  constructor(private readonly deps: ProductionServiceDeps) {}

  async create(props: CreateProductionProps): Promise<Production> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const existing = await this.deps.productionRepository.findByOrganization(
      props.organizationId,
    );
    ProductionLifecyclePolicy.assertUniqueName(
      existing,
      props.name,
      props.organizationId,
    );

    const production = Production.create(props);
    await this.deps.productionRepository.save(production);
    await this.deps.eventPublisher.publish(production.pullDomainEvents());
    return production;
  }

  async getById(id: ProductionId): Promise<Production> {
    const production = await this.deps.productionRepository.findById(id);
    if (!production) throw new ProductionNotFoundError(id);
    return production;
  }

  async start(id: ProductionId, now?: Date): Promise<Production> {
    const production = await this.getById(id);
    ProductionLifecyclePolicy.assertCanTransition(
      production,
      ProductionStatus.ACTIVE,
    );
    production.start(now);
    await this.deps.productionRepository.update(production);
    await this.deps.eventPublisher.publish(production.pullDomainEvents());
    return production;
  }

  async pause(id: ProductionId, now?: Date): Promise<Production> {
    const production = await this.getById(id);
    production.pause(now);
    await this.deps.productionRepository.update(production);
    await this.deps.eventPublisher.publish(production.pullDomainEvents());
    return production;
  }

  async resume(id: ProductionId, now?: Date): Promise<Production> {
    const production = await this.getById(id);
    production.resume(now);
    await this.deps.productionRepository.update(production);
    await this.deps.eventPublisher.publish(production.pullDomainEvents());
    return production;
  }

  async complete(id: ProductionId, now?: Date): Promise<Production> {
    const production = await this.getById(id);
    ProductionLifecyclePolicy.assertCanTransition(
      production,
      ProductionStatus.COMPLETED,
    );
    production.complete(now);
    await this.deps.productionRepository.update(production);
    await this.deps.eventPublisher.publish(production.pullDomainEvents());
    return production;
  }

  async archive(id: ProductionId, now?: Date): Promise<Production> {
    const production = await this.getById(id);
    ProductionLifecyclePolicy.assertCanTransition(
      production,
      ProductionStatus.ARCHIVED,
    );
    production.archive(now);
    await this.deps.productionRepository.archive(id);
    await this.deps.productionRepository.update(production);
    await this.deps.eventPublisher.publish(production.pullDomainEvents());
    return production;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Production[]> {
    return this.deps.productionRepository.findByOrganization(organizationId);
  }

  async listByProject(projectId: ProjectId): Promise<Production[]> {
    return this.deps.productionRepository.findByProject(projectId);
  }

  async listByWorkOrder(workOrderId: WorkOrderId): Promise<Production[]> {
    return this.deps.productionRepository.findByWorkOrder(workOrderId);
  }

  async listByOwner(ownerId: string): Promise<Production[]> {
    return this.deps.productionRepository.findByOwner(ownerId);
  }
}
