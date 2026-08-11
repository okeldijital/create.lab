import type { InitiativePriority } from "../enums/InitiativePriority.js";
import {
  Initiative,
  type CreateInitiativeProps,
} from "../aggregates/Initiative/Initiative.js";
import {
  InitiativeNotFoundError,
  PortfolioNotFoundError,
} from "../errors/PortfolioErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { InitiativePolicy } from "../policies/InitiativePolicy.js";
import { PortfolioLifecyclePolicy } from "../policies/PortfolioLifecyclePolicy.js";
import type { InitiativeRepository } from "../repositories/InitiativeRepository.js";
import type { PortfolioRepository } from "../repositories/PortfolioRepository.js";
import type { InitiativeId, PortfolioId } from "../types/ids.js";

export type InitiativeServiceDeps = {
  initiativeRepository: InitiativeRepository;
  portfolioRepository: PortfolioRepository;
  eventPublisher: DomainEventPublisher;
};

export type AddInitiativeProps = {
  organizationId: CreateInitiativeProps["organizationId"];
  portfolioId: PortfolioId;
  title: string;
  description?: string | null;
  priority?: InitiativePriority;
  now?: Date;
};

export class InitiativeService {
  constructor(private readonly deps: InitiativeServiceDeps) {}

  async create(props: AddInitiativeProps): Promise<Initiative> {
    const portfolio = await this.deps.portfolioRepository.findById(
      props.portfolioId,
    );
    if (!portfolio) throw new PortfolioNotFoundError(props.portfolioId);
    PortfolioLifecyclePolicy.assertStructurallyEditable(portfolio);

    const existing = await this.deps.initiativeRepository.findByPortfolio(
      props.portfolioId,
    );
    InitiativePolicy.assertUniqueTitle(
      props.portfolioId,
      props.title,
      existing,
    );

    const initiative = Initiative.create({
      organizationId: props.organizationId,
      portfolioId: props.portfolioId,
      title: props.title,
      description: props.description,
      priority: props.priority,
      now: props.now,
    });
    portfolio.addInitiativeId(initiative.id, props.now);

    await this.deps.initiativeRepository.save(initiative);
    await this.deps.portfolioRepository.update(portfolio);
    await this.deps.eventPublisher.publish([
      ...initiative.pullDomainEvents(),
      ...portfolio.pullDomainEvents(),
    ]);
    return initiative;
  }

  async activate(id: InitiativeId, now?: Date): Promise<Initiative> {
    const init = await this.getById(id);
    InitiativePolicy.assertMutable(init);
    init.activate(now);
    await this.deps.initiativeRepository.update(init);
    await this.deps.eventPublisher.publish(init.pullDomainEvents());
    return init;
  }

  async complete(id: InitiativeId, now?: Date): Promise<Initiative> {
    const init = await this.getById(id);
    InitiativePolicy.assertMutable(init);
    init.complete(now);
    await this.deps.initiativeRepository.update(init);
    await this.deps.eventPublisher.publish(init.pullDomainEvents());
    return init;
  }

  async cancel(id: InitiativeId, now?: Date): Promise<Initiative> {
    const init = await this.getById(id);
    InitiativePolicy.assertMutable(init);
    init.cancel(now);
    await this.deps.initiativeRepository.update(init);
    await this.deps.eventPublisher.publish(init.pullDomainEvents());
    return init;
  }

  async getById(id: InitiativeId): Promise<Initiative> {
    const i = await this.deps.initiativeRepository.findById(id);
    if (!i) throw new InitiativeNotFoundError(id);
    return i;
  }

  async listByPortfolio(portfolioId: PortfolioId): Promise<Initiative[]> {
    return this.deps.initiativeRepository.findByPortfolio(portfolioId);
  }
}
