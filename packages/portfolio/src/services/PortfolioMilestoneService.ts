import {
  PortfolioMilestone,
  type CreatePortfolioMilestoneProps,
} from "../aggregates/PortfolioMilestone/PortfolioMilestone.js";
import {
  PortfolioMilestoneNotFoundError,
  PortfolioNotFoundError,
} from "../errors/PortfolioErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { PortfolioLifecyclePolicy } from "../policies/PortfolioLifecyclePolicy.js";
import { PortfolioMilestonePolicy } from "../policies/PortfolioMilestonePolicy.js";
import type { PortfolioMilestoneRepository } from "../repositories/PortfolioMilestoneRepository.js";
import type { PortfolioRepository } from "../repositories/PortfolioRepository.js";
import type { PortfolioId, PortfolioMilestoneId } from "../types/ids.js";

export type PortfolioMilestoneServiceDeps = {
  portfolioMilestoneRepository: PortfolioMilestoneRepository;
  portfolioRepository: PortfolioRepository;
  eventPublisher: DomainEventPublisher;
};

export type AddMilestoneProps = {
  organizationId: CreatePortfolioMilestoneProps["organizationId"];
  portfolioId: PortfolioId;
  title: string;
  targetDate: Date;
  sequence?: number;
  now?: Date;
};

export class PortfolioMilestoneService {
  constructor(private readonly deps: PortfolioMilestoneServiceDeps) {}

  async create(props: AddMilestoneProps): Promise<PortfolioMilestone> {
    const portfolio = await this.deps.portfolioRepository.findById(
      props.portfolioId,
    );
    if (!portfolio) throw new PortfolioNotFoundError(props.portfolioId);
    PortfolioLifecyclePolicy.assertStructurallyEditable(portfolio);

    const existing =
      await this.deps.portfolioMilestoneRepository.findByPortfolio(
        props.portfolioId,
      );
    const sequence =
      props.sequence ?? PortfolioMilestonePolicy.nextSequence(existing);
    PortfolioMilestonePolicy.assertUniqueSequence(sequence, existing);
    PortfolioMilestonePolicy.assertChronological(
      sequence,
      props.targetDate,
      existing,
    );

    const milestone = PortfolioMilestone.create({
      organizationId: props.organizationId,
      portfolioId: props.portfolioId,
      title: props.title,
      targetDate: props.targetDate,
      sequence,
      now: props.now,
    });

    await this.deps.portfolioMilestoneRepository.save(milestone);
    await this.deps.eventPublisher.publish(milestone.pullDomainEvents());
    return milestone;
  }

  async activate(
    id: PortfolioMilestoneId,
    now?: Date,
  ): Promise<PortfolioMilestone> {
    const m = await this.getById(id);
    const portfolio = await this.deps.portfolioRepository.findById(
      m.portfolioId,
    );
    if (!portfolio) throw new PortfolioNotFoundError(m.portfolioId);
    PortfolioLifecyclePolicy.assertActive(portfolio);

    const existing =
      await this.deps.portfolioMilestoneRepository.findByPortfolio(
        m.portfolioId,
      );
    PortfolioMilestonePolicy.assertOneActive(existing, m.id);
    m.activate(now);
    await this.deps.portfolioMilestoneRepository.update(m);
    await this.deps.eventPublisher.publish(m.pullDomainEvents());
    return m;
  }

  async complete(
    id: PortfolioMilestoneId,
    now?: Date,
  ): Promise<PortfolioMilestone> {
    const m = await this.getById(id);
    const portfolio = await this.deps.portfolioRepository.findById(
      m.portfolioId,
    );
    if (!portfolio) throw new PortfolioNotFoundError(m.portfolioId);
    PortfolioLifecyclePolicy.assertActive(portfolio);
    m.complete(now);
    await this.deps.portfolioMilestoneRepository.update(m);
    await this.deps.eventPublisher.publish(m.pullDomainEvents());
    return m;
  }

  async getById(id: PortfolioMilestoneId): Promise<PortfolioMilestone> {
    const m = await this.deps.portfolioMilestoneRepository.findById(id);
    if (!m) throw new PortfolioMilestoneNotFoundError(id);
    return m;
  }

  async listByPortfolio(
    portfolioId: PortfolioId,
  ): Promise<PortfolioMilestone[]> {
    const list =
      await this.deps.portfolioMilestoneRepository.findByPortfolio(
        portfolioId,
      );
    return list.sort((a, b) => a.sequence - b.sequence);
  }
}
