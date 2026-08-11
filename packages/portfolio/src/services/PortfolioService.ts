import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  Portfolio,
  type CreatePortfolioProps,
} from "../aggregates/Portfolio/Portfolio.js";
import { PortfolioStatus } from "../enums/PortfolioStatus.js";
import {
  DuplicatePortfolioNumberError,
  PortfolioNotFoundError,
} from "../errors/PortfolioErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { PortfolioLifecyclePolicy } from "../policies/PortfolioLifecyclePolicy.js";
import type { PortfolioRepository } from "../repositories/PortfolioRepository.js";
import type { PortfolioId } from "../types/ids.js";
import { PortfolioNumber } from "../value-objects/PortfolioNumber.js";

export type PortfolioServiceDeps = {
  portfolioRepository: PortfolioRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class PortfolioService {
  constructor(private readonly deps: PortfolioServiceDeps) {}

  async create(props: CreatePortfolioProps): Promise<Portfolio> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const portfolio = Portfolio.create(props);
    const existing = await this.deps.portfolioRepository.findByPortfolioNumber(
      props.organizationId,
      portfolio.portfolioNumber.value,
    );
    if (existing) {
      throw new DuplicatePortfolioNumberError(
        portfolio.portfolioNumber.value,
        props.organizationId,
      );
    }
    await this.deps.portfolioRepository.save(portfolio);
    await this.deps.eventPublisher.publish(portfolio.pullDomainEvents());
    return portfolio;
  }

  async activate(id: PortfolioId, now?: Date): Promise<Portfolio> {
    const p = await this.getById(id);
    PortfolioLifecyclePolicy.assertCanTransition(p, PortfolioStatus.ACTIVE);
    p.activate(now);
    await this.deps.portfolioRepository.update(p);
    await this.deps.eventPublisher.publish(p.pullDomainEvents());
    return p;
  }

  async hold(id: PortfolioId, now?: Date): Promise<Portfolio> {
    const p = await this.getById(id);
    PortfolioLifecyclePolicy.assertCanTransition(p, PortfolioStatus.ON_HOLD);
    p.hold(now);
    await this.deps.portfolioRepository.update(p);
    await this.deps.eventPublisher.publish(p.pullDomainEvents());
    return p;
  }

  async resume(id: PortfolioId, now?: Date): Promise<Portfolio> {
    const p = await this.getById(id);
    PortfolioLifecyclePolicy.assertCanTransition(p, PortfolioStatus.ACTIVE);
    p.resume(now);
    await this.deps.portfolioRepository.update(p);
    await this.deps.eventPublisher.publish(p.pullDomainEvents());
    return p;
  }

  async complete(
    id: PortfolioId,
    completedDate?: Date,
    now?: Date,
  ): Promise<Portfolio> {
    const p = await this.getById(id);
    PortfolioLifecyclePolicy.assertCanTransition(p, PortfolioStatus.COMPLETED);
    p.complete(completedDate, now);
    await this.deps.portfolioRepository.update(p);
    await this.deps.eventPublisher.publish(p.pullDomainEvents());
    return p;
  }

  async cancel(id: PortfolioId, now?: Date): Promise<Portfolio> {
    const p = await this.getById(id);
    PortfolioLifecyclePolicy.assertCanTransition(p, PortfolioStatus.CANCELLED);
    p.cancel(now);
    await this.deps.portfolioRepository.update(p);
    await this.deps.eventPublisher.publish(p.pullDomainEvents());
    return p;
  }

  async archive(id: PortfolioId, now?: Date): Promise<Portfolio> {
    const p = await this.getById(id);
    PortfolioLifecyclePolicy.assertCanTransition(p, PortfolioStatus.ARCHIVED);
    p.archive(now);
    await this.deps.portfolioRepository.archive(id);
    await this.deps.portfolioRepository.update(p);
    await this.deps.eventPublisher.publish(p.pullDomainEvents());
    return p;
  }

  async getById(id: PortfolioId): Promise<Portfolio> {
    const p = await this.deps.portfolioRepository.findById(id);
    if (!p) throw new PortfolioNotFoundError(id);
    return p;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Portfolio[]> {
    return this.deps.portfolioRepository.findByOrganization(organizationId);
  }

  async findByPortfolioNumber(
    organizationId: OrganizationId,
    portfolioNumber: string,
  ): Promise<Portfolio | null> {
    return this.deps.portfolioRepository.findByPortfolioNumber(
      organizationId,
      PortfolioNumber.create(portfolioNumber).value,
    );
  }
}
