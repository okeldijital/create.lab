import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Asset,
  AssetId,
  AssetRepository,
  AssetType,
} from "@creative-lab/assets";
import type {
  Invoice,
  InvoiceId,
  InvoiceRepository,
} from "@creative-lab/billing";
import type { DeliveryId } from "@creative-lab/delivery";
import type {
  CategoryStatus,
  KnowledgeArticle,
  KnowledgeArticleId,
  KnowledgeArticleRepository,
  KnowledgeCategory,
  KnowledgeCategoryId,
  KnowledgeCategoryRepository,
  KnowledgeStatus,
} from "@creative-lab/knowledge";
import type { WorkOrderId } from "@creative-lab/operations";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSettings,
  OrganizationSettingsRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type {
  Portfolio,
  PortfolioId,
  PortfolioRepository,
  PortfolioStatus,
} from "@creative-lab/portfolio";
import type {
  Production,
  ProductionId,
  ProductionRepository,
} from "@creative-lab/production";
import type {
  Project,
  ProjectId,
  ProjectRepository,
} from "@creative-lab/projects";
import type { AuthorizationService } from "../../authorization/AuthorizationService.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { EventDispatcher } from "../../events/EventDispatcher.js";
import type { IntegrationEvent } from "../../events/IntegrationEvent.js";
import type { UnitOfWork } from "../../transactions/UnitOfWork.js";
import type { ApplicationContext } from "../../types/context.js";
import type { Permission } from "../../types/ids.js";
import { asActorId } from "../../types/ids.js";

export class InMemoryUnitOfWork implements UnitOfWork {
  private active = false;
  began = 0;
  committed = 0;
  rolledBack = 0;

  async begin(): Promise<void> {
    if (this.active) throw new Error("UoW already active");
    this.active = true;
    this.began += 1;
  }
  async commit(): Promise<void> {
    if (!this.active) throw new Error("UoW not active");
    this.active = false;
    this.committed += 1;
  }
  async rollback(): Promise<void> {
    if (!this.active) throw new Error("UoW not active");
    this.active = false;
    this.rolledBack += 1;
  }
  isActive(): boolean {
    return this.active;
  }
}

export class InMemoryEventDispatcher implements EventDispatcher {
  readonly events: Array<IntegrationEvent | AnyDomainEvent> = [];
  async publish(event: IntegrationEvent | AnyDomainEvent): Promise<void> {
    this.events.push(event);
  }
  async publishMany(
    events: readonly (IntegrationEvent | AnyDomainEvent)[],
  ): Promise<void> {
    this.events.push(...events);
  }
}

export class AllowAllAuthorization implements AuthorizationService {
  async can(
    _permission: Permission,
    _context: ApplicationContext,
  ): Promise<boolean> {
    return true;
  }
  async assertCan(
    _permission: Permission,
    _context: ApplicationContext,
  ): Promise<void> {}
  async canCreateProject(_context: ApplicationContext): Promise<boolean> {
    return true;
  }
  async canApproveInvoice(_context: ApplicationContext): Promise<boolean> {
    return true;
  }
  async canArchiveAsset(_context: ApplicationContext): Promise<boolean> {
    return true;
  }
  async canCreateOrganization(_context: ApplicationContext): Promise<boolean> {
    return true;
  }
  async canApproveReview(_context: ApplicationContext): Promise<boolean> {
    return true;
  }
  async canIssueQuote(_context: ApplicationContext): Promise<boolean> {
    return true;
  }
  async canActivateContract(_context: ApplicationContext): Promise<boolean> {
    return true;
  }
}

export class DenyAllAuthorization implements AuthorizationService {
  async can(
    _permission: Permission,
    _context: ApplicationContext,
  ): Promise<boolean> {
    return false;
  }
  async assertCan(
    _permission: Permission,
    _context: ApplicationContext,
  ): Promise<void> {
    throw new AuthorizationError();
  }
  async canCreateProject(_context: ApplicationContext): Promise<boolean> {
    return false;
  }
  async canApproveInvoice(_context: ApplicationContext): Promise<boolean> {
    return false;
  }
  async canArchiveAsset(_context: ApplicationContext): Promise<boolean> {
    return false;
  }
  async canCreateOrganization(_context: ApplicationContext): Promise<boolean> {
    return false;
  }
  async canApproveReview(_context: ApplicationContext): Promise<boolean> {
    return false;
  }
  async canIssueQuote(_context: ApplicationContext): Promise<boolean> {
    return false;
  }
  async canActivateContract(_context: ApplicationContext): Promise<boolean> {
    return false;
  }
}

export class PermissionMapAuthorization implements AuthorizationService {
  constructor(private readonly allowed: ReadonlySet<Permission>) {}
  async can(
    permission: Permission,
    _context: ApplicationContext,
  ): Promise<boolean> {
    return this.allowed.has(permission);
  }
  async assertCan(
    permission: Permission,
    context: ApplicationContext,
  ): Promise<void> {
    if (!(await this.can(permission, context))) throw new AuthorizationError();
  }
  async canCreateProject(ctx: ApplicationContext): Promise<boolean> {
    return this.can("project.create", ctx);
  }
  async canApproveInvoice(ctx: ApplicationContext): Promise<boolean> {
    return this.can("invoice.approve", ctx);
  }
  async canArchiveAsset(ctx: ApplicationContext): Promise<boolean> {
    return this.can("asset.archive", ctx);
  }
  async canCreateOrganization(ctx: ApplicationContext): Promise<boolean> {
    return this.can("organization.create", ctx);
  }
  async canApproveReview(ctx: ApplicationContext): Promise<boolean> {
    return this.can("review.approve", ctx);
  }
  async canIssueQuote(ctx: ApplicationContext): Promise<boolean> {
    return this.can("quote.issue", ctx);
  }
  async canActivateContract(ctx: ApplicationContext): Promise<boolean> {
    return this.can("contract.activate", ctx);
  }
}

export function testContext(
  organizationId: OrganizationId,
  actorId = "actor-1",
): ApplicationContext {
  return {
    organizationId,
    actorId: asActorId(actorId),
    correlationId: "corr-1",
  };
}

export class InMemoryOrganizationRepository
  implements OrganizationRepository
{
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

export class InMemoryOrganizationSettingsRepository
  implements OrganizationSettingsRepository
{
  private readonly byOrg = new Map<string, OrganizationSettings>();
  async findByOrganizationId(
    organizationId: OrganizationId,
  ): Promise<OrganizationSettings | null> {
    return this.byOrg.get(organizationId) ?? null;
  }
  async findById(
    organizationId: OrganizationId,
  ): Promise<OrganizationSettings | null> {
    return this.byOrg.get(organizationId) ?? null;
  }
  async findAll(): Promise<OrganizationSettings[]> {
    return [...this.byOrg.values()];
  }
  async save(s: OrganizationSettings): Promise<void> {
    this.byOrg.set(s.organizationId, s);
  }
  async update(s: OrganizationSettings): Promise<void> {
    this.byOrg.set(s.organizationId, s);
  }
  async archive(organizationId: OrganizationId): Promise<void> {
    void organizationId;
  }
  async exists(organizationId: OrganizationId): Promise<boolean> {
    return this.byOrg.has(organizationId);
  }
  async delete(organizationId: OrganizationId): Promise<void> {
    this.byOrg.delete(organizationId);
  }
}

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly byId = new Map<string, Project>();
  async findById(id: ProjectId): Promise<Project | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Project[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId,
    );
  }
  async findByOwner(ownerId: string): Promise<Project[]> {
    return [...this.byId.values()].filter((p) => p.ownerId === ownerId);
  }
  async findActive(): Promise<Project[]> {
    return [...this.byId.values()].filter((p) => p.isActive);
  }
  async save(project: Project): Promise<void> {
    this.byId.set(project.id, project);
  }
  async update(project: Project): Promise<void> {
    this.byId.set(project.id, project);
  }
  async archive(id: ProjectId): Promise<void> {
    void id;
  }
  async exists(id: ProjectId): Promise<boolean> {
    return this.byId.has(id);
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
  async save(p: Portfolio): Promise<void> {
    this.byId.set(p.id, p);
  }
  async update(p: Portfolio): Promise<void> {
    this.byId.set(p.id, p);
  }
  async archive(id: PortfolioId): Promise<void> {
    void id;
  }
  async exists(id: PortfolioId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryKnowledgeArticleRepository
  implements KnowledgeArticleRepository
{
  private readonly byId = new Map<string, KnowledgeArticle>();
  async findById(id: KnowledgeArticleId): Promise<KnowledgeArticle | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeArticle[]> {
    return [...this.byId.values()].filter(
      (a) => a.organizationId === organizationId,
    );
  }
  async findByCategory(
    categoryId: KnowledgeCategoryId,
  ): Promise<KnowledgeArticle[]> {
    return [...this.byId.values()].filter((a) => a.categoryId === categoryId);
  }
  async findByStatus(status: KnowledgeStatus): Promise<KnowledgeArticle[]> {
    return [...this.byId.values()].filter((a) => a.status === status);
  }
  async findByArticleNumber(
    organizationId: OrganizationId,
    articleNumber: string,
  ): Promise<KnowledgeArticle | null> {
    return (
      [...this.byId.values()].find(
        (a) =>
          a.organizationId === organizationId &&
          a.articleNumber.value === articleNumber,
      ) ?? null
    );
  }
  async save(a: KnowledgeArticle): Promise<void> {
    this.byId.set(a.id, a);
  }
  async update(a: KnowledgeArticle): Promise<void> {
    this.byId.set(a.id, a);
  }
  async archive(id: KnowledgeArticleId): Promise<void> {
    void id;
  }
  async exists(id: KnowledgeArticleId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryKnowledgeCategoryRepository
  implements KnowledgeCategoryRepository
{
  private readonly byId = new Map<string, KnowledgeCategory>();
  async findById(id: KnowledgeCategoryId): Promise<KnowledgeCategory | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeCategory[]> {
    return [...this.byId.values()].filter(
      (c) => c.organizationId === organizationId,
    );
  }
  async findByStatus(status: CategoryStatus): Promise<KnowledgeCategory[]> {
    return [...this.byId.values()].filter((c) => c.status === status);
  }
  async findByName(
    organizationId: OrganizationId,
    name: string,
  ): Promise<KnowledgeCategory | null> {
    return (
      [...this.byId.values()].find(
        (c) =>
          c.organizationId === organizationId &&
          c.name.value.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  }
  async save(c: KnowledgeCategory): Promise<void> {
    this.byId.set(c.id, c);
  }
  async update(c: KnowledgeCategory): Promise<void> {
    this.byId.set(c.id, c);
  }
  async archive(id: KnowledgeCategoryId): Promise<void> {
    void id;
  }
  async exists(id: KnowledgeCategoryId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryAssetRepository implements AssetRepository {
  private readonly byId = new Map<string, Asset>();
  async findById(id: AssetId): Promise<Asset | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(organizationId: OrganizationId): Promise<Asset[]> {
    return [...this.byId.values()].filter(
      (a) => a.organizationId === organizationId,
    );
  }
  async findByProject(projectId: ProjectId): Promise<Asset[]> {
    return [...this.byId.values()].filter((a) => a.projectId === projectId);
  }
  async findByProduction(productionId: ProductionId): Promise<Asset[]> {
    return [...this.byId.values()].filter(
      (a) => a.productionId === productionId,
    );
  }
  async findByType(assetType: AssetType): Promise<Asset[]> {
    return [...this.byId.values()].filter((a) => a.assetType === assetType);
  }
  async save(a: Asset): Promise<void> {
    this.byId.set(a.id, a);
  }
  async update(a: Asset): Promise<void> {
    this.byId.set(a.id, a);
  }
  async archive(id: AssetId): Promise<void> {
    void id;
  }
  async exists(id: AssetId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryInvoiceRepository implements InvoiceRepository {
  private readonly byId = new Map<string, Invoice>();
  async findById(id: InvoiceId): Promise<Invoice | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Invoice[]> {
    return [...this.byId.values()].filter(
      (i) => i.organizationId === organizationId,
    );
  }
  async findByProject(projectId: ProjectId): Promise<Invoice[]> {
    return [...this.byId.values()].filter((i) => i.projectId === projectId);
  }
  async findByDelivery(deliveryId: DeliveryId): Promise<Invoice[]> {
    return [...this.byId.values()].filter((i) => i.deliveryId === deliveryId);
  }
  async findByCustomer(customerId: string): Promise<Invoice[]> {
    return [...this.byId.values()].filter((i) => i.customerId === customerId);
  }
  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    return (
      [...this.byId.values()].find(
        (i) => i.invoiceNumber.value === invoiceNumber,
      ) ?? null
    );
  }
  async findOutstanding(): Promise<Invoice[]> {
    return [...this.byId.values()].filter((i) => !i.isPaid && !i.isVoid);
  }
  async findPaid(): Promise<Invoice[]> {
    return [...this.byId.values()].filter((i) => i.isPaid);
  }
  async save(i: Invoice): Promise<void> {
    this.byId.set(i.id, i);
  }
  async update(i: Invoice): Promise<void> {
    this.byId.set(i.id, i);
  }
  async archive(id: InvoiceId): Promise<void> {
    void id;
  }
  async exists(id: InvoiceId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryProductionRepository implements ProductionRepository {
  private readonly byId = new Map<string, Production>();
  async findById(id: ProductionId): Promise<Production | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Production[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId,
    );
  }
  async findByProject(projectId: ProjectId): Promise<Production[]> {
    return [...this.byId.values()].filter((p) => p.projectId === projectId);
  }
  async findByWorkOrder(workOrderId: WorkOrderId): Promise<Production[]> {
    return [...this.byId.values()].filter(
      (p) => p.workOrderId === workOrderId,
    );
  }
  async findByOwner(ownerId: string): Promise<Production[]> {
    return [...this.byId.values()].filter((p) => p.ownerId === ownerId);
  }
  async findActive(): Promise<Production[]> {
    return [...this.byId.values()].filter((p) => p.isActive);
  }
  async save(p: Production): Promise<void> {
    this.byId.set(p.id, p);
  }
  async update(p: Production): Promise<void> {
    this.byId.set(p.id, p);
  }
  async archive(id: ProductionId): Promise<void> {
    void id;
  }
  async exists(id: ProductionId): Promise<boolean> {
    return this.byId.has(id);
  }
}
