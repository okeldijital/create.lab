import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { Initiative } from "../../aggregates/Initiative/Initiative.js";
import type { Portfolio } from "../../aggregates/Portfolio/Portfolio.js";
import type { PortfolioMilestone } from "../../aggregates/PortfolioMilestone/PortfolioMilestone.js";
import type { Program } from "../../aggregates/Program/Program.js";
import type { PortfolioStatus } from "../../enums/PortfolioStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { InitiativeRepository } from "../../repositories/InitiativeRepository.js";
import type { PortfolioMilestoneRepository } from "../../repositories/PortfolioMilestoneRepository.js";
import type { PortfolioRepository } from "../../repositories/PortfolioRepository.js";
import type { ProgramRepository } from "../../repositories/ProgramRepository.js";
import type {
  InitiativeId,
  PortfolioId,
  PortfolioMilestoneId,
  ProgramId,
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

export class InMemoryPortfolioRepository implements PortfolioRepository {
  private readonly byId = new Map<string, Portfolio>();
  async findById(id: PortfolioId): Promise<Portfolio | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Portfolio[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId,
    );
  }
  async findByStatus(status: PortfolioStatus): Promise<Portfolio[]> {
    return [...this.byId.values()].filter((p) => p.status === status);
  }
  async findByPortfolioNumber(
    organizationId: OrganizationId,
    portfolioNumber: string,
  ): Promise<Portfolio | null> {
    return (
      [...this.byId.values()].find(
        (p) =>
          p.organizationId === organizationId &&
          p.portfolioNumber.value === portfolioNumber,
      ) ?? null
    );
  }
  async save(portfolio: Portfolio): Promise<void> {
    this.byId.set(portfolio.id, portfolio);
  }
  async update(portfolio: Portfolio): Promise<void> {
    this.byId.set(portfolio.id, portfolio);
  }
  async archive(id: PortfolioId): Promise<void> {
    void id;
  }
  async exists(id: PortfolioId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryProgramRepository implements ProgramRepository {
  private readonly byId = new Map<string, Program>();
  async findById(id: ProgramId): Promise<Program | null> {
    return this.byId.get(id) ?? null;
  }
  async findByPortfolio(portfolioId: PortfolioId): Promise<Program[]> {
    return [...this.byId.values()].filter((p) => p.portfolioId === portfolioId);
  }
  async save(program: Program): Promise<void> {
    this.byId.set(program.id, program);
  }
  async update(program: Program): Promise<void> {
    this.byId.set(program.id, program);
  }
  async exists(id: ProgramId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryInitiativeRepository implements InitiativeRepository {
  private readonly byId = new Map<string, Initiative>();
  async findById(id: InitiativeId): Promise<Initiative | null> {
    return this.byId.get(id) ?? null;
  }
  async findByPortfolio(portfolioId: PortfolioId): Promise<Initiative[]> {
    return [...this.byId.values()].filter((i) => i.portfolioId === portfolioId);
  }
  async save(initiative: Initiative): Promise<void> {
    this.byId.set(initiative.id, initiative);
  }
  async update(initiative: Initiative): Promise<void> {
    this.byId.set(initiative.id, initiative);
  }
  async exists(id: InitiativeId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryPortfolioMilestoneRepository
  implements PortfolioMilestoneRepository
{
  private readonly byId = new Map<string, PortfolioMilestone>();
  async findById(
    id: PortfolioMilestoneId,
  ): Promise<PortfolioMilestone | null> {
    return this.byId.get(id) ?? null;
  }
  async findByPortfolio(
    portfolioId: PortfolioId,
  ): Promise<PortfolioMilestone[]> {
    return [...this.byId.values()].filter(
      (m) => m.portfolioId === portfolioId,
    );
  }
  async save(milestone: PortfolioMilestone): Promise<void> {
    this.byId.set(milestone.id, milestone);
  }
  async update(milestone: PortfolioMilestone): Promise<void> {
    this.byId.set(milestone.id, milestone);
  }
  async exists(id: PortfolioMilestoneId): Promise<boolean> {
    return this.byId.has(id);
  }
}
