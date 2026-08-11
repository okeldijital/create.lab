import {
  ProductionMilestone,
  type CreateProductionMilestoneProps,
} from "../aggregates/ProductionMilestone/ProductionMilestone.js";
import {
  MilestoneNotFoundError,
  ProductionNotFoundError,
} from "../errors/ProductionErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { MilestonePolicy } from "../policies/MilestonePolicy.js";
import { ProductionLifecyclePolicy } from "../policies/ProductionLifecyclePolicy.js";
import type { MilestoneRepository } from "../repositories/MilestoneRepository.js";
import type { ProductionRepository } from "../repositories/ProductionRepository.js";
import type { ProductionId, ProductionMilestoneId } from "../types/ids.js";

export type MilestoneServiceDeps = {
  milestoneRepository: MilestoneRepository;
  productionRepository: ProductionRepository;
  eventPublisher: DomainEventPublisher;
};

export class MilestoneService {
  constructor(private readonly deps: MilestoneServiceDeps) {}

  async create(
    props: CreateProductionMilestoneProps,
  ): Promise<ProductionMilestone> {
    const production = await this.deps.productionRepository.findById(
      props.productionId,
    );
    if (!production) throw new ProductionNotFoundError(props.productionId);
    ProductionLifecyclePolicy.assertAcceptsChildActivity(production);

    const existing = await this.deps.milestoneRepository.findByProduction(
      props.productionId,
    );
    MilestonePolicy.assertUniqueSequence(existing, props.sequence);
    MilestonePolicy.assertNoGaps(existing, props.sequence);

    const milestone = ProductionMilestone.create(props);
    await this.deps.milestoneRepository.save(milestone);
    await this.deps.eventPublisher.publish(milestone.pullDomainEvents());
    return milestone;
  }

  async activate(
    id: ProductionMilestoneId,
    now?: Date,
  ): Promise<ProductionMilestone> {
    const milestone = await this.getById(id);
    const siblings = await this.deps.milestoneRepository.findByProduction(
      milestone.productionId,
    );
    MilestonePolicy.assertSingleActive(siblings, milestone.id);
    MilestonePolicy.assertOrderedActivation(siblings, milestone);
    milestone.activate(now);
    await this.deps.milestoneRepository.update(milestone);
    await this.deps.eventPublisher.publish(milestone.pullDomainEvents());
    return milestone;
  }

  async complete(
    id: ProductionMilestoneId,
    now?: Date,
  ): Promise<ProductionMilestone> {
    const milestone = await this.getById(id);
    milestone.complete(now);
    await this.deps.milestoneRepository.update(milestone);
    await this.deps.eventPublisher.publish(milestone.pullDomainEvents());
    return milestone;
  }

  async reorder(
    id: ProductionMilestoneId,
    sequence: number,
    now?: Date,
  ): Promise<ProductionMilestone> {
    const milestone = await this.getById(id);
    const siblings = (
      await this.deps.milestoneRepository.findByProduction(
        milestone.productionId,
      )
    ).filter((m) => m.id !== milestone.id);
    MilestonePolicy.assertUniqueSequence(siblings, sequence, milestone.id);
    milestone.reorder(sequence, now);
    await this.deps.milestoneRepository.update(milestone);
    await this.deps.eventPublisher.publish(milestone.pullDomainEvents());
    return milestone;
  }

  async getById(id: ProductionMilestoneId): Promise<ProductionMilestone> {
    const milestone = await this.deps.milestoneRepository.findById(id);
    if (!milestone) throw new MilestoneNotFoundError(id);
    return milestone;
  }

  async listByProduction(
    productionId: ProductionId,
  ): Promise<ProductionMilestone[]> {
    return this.deps.milestoneRepository.findByProduction(productionId);
  }
}
