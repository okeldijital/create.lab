import { describe, expect, it, beforeEach } from "vitest";
import {
  KnowledgeCategory,
  KnowledgeCategoryService,
} from "@creative-lab/knowledge";
import {
  Organization,
  asOrganizationId,
} from "@creative-lab/organization";
import {
  createKnowledgeArticleCommand,
  createOrganizationCommand,
  createPortfolioCommand,
  createProjectCommand,
  archiveOrganizationCommand,
} from "../../commands/index.js";
import { ValidationError } from "../../errors/ApplicationErrors.js";
import {
  ArchiveOrganizationHandler,
  CreateKnowledgeArticleHandler,
  CreateOrganizationHandler,
  CreatePortfolioHandler,
  CreateProjectHandler,
  FindInvoicesHandler,
  GetOrganizationHandler,
  GetProjectHandler,
  ListAssetsHandler,
  SearchKnowledgeHandler,
} from "../../handlers/index.js";
import {
  getOrganizationQuery,
  getProjectQuery,
  findInvoicesQuery,
  listAssetsQuery,
  searchKnowledgeQuery,
} from "../../queries/index.js";
import { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import { UseCaseExecutor } from "../../services/UseCaseExecutor.js";
import {
  AllowAllAuthorization,
  InMemoryEventDispatcher,
  InMemoryKnowledgeArticleRepository,
  InMemoryKnowledgeCategoryRepository,
  InMemoryOrganizationRepository,
  InMemoryOrganizationSettingsRepository,
  InMemoryPortfolioRepository,
  InMemoryProjectRepository,
  InMemoryInvoiceRepository,
  InMemoryAssetRepository,
  InMemoryUnitOfWork,
  testContext,
} from "../helpers/fakes.js";

describe("Handlers orchestration", () => {
  const orgId = asOrganizationId("org-app-1");
  let orgs: InMemoryOrganizationRepository;
  let settings: InMemoryOrganizationSettingsRepository;
  let projects: InMemoryProjectRepository;
  let portfolios: InMemoryPortfolioRepository;
  let articles: InMemoryKnowledgeArticleRepository;
  let categories: InMemoryKnowledgeCategoryRepository;
  let invoices: InMemoryInvoiceRepository;
  let assets: InMemoryAssetRepository;
  let events: CollectingEventPublisher;
  let ctx: ReturnType<typeof testContext>;
  let executor: UseCaseExecutor;
  let uow: InMemoryUnitOfWork;
  let dispatcher: InMemoryEventDispatcher;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    settings = new InMemoryOrganizationSettingsRepository();
    projects = new InMemoryProjectRepository();
    portfolios = new InMemoryPortfolioRepository();
    articles = new InMemoryKnowledgeArticleRepository();
    categories = new InMemoryKnowledgeCategoryRepository();
    invoices = new InMemoryInvoiceRepository();
    assets = new InMemoryAssetRepository();
    events = new CollectingEventPublisher();
    uow = new InMemoryUnitOfWork();
    dispatcher = new InMemoryEventDispatcher();
    ctx = testContext(orgId);

    // seed organization for project/portfolio/knowledge
    await orgs.save(
      Organization.create({
        name: "Studio",
        slug: "studio-app",
        id: orgId,
      }),
    );

    const createOrg = new CreateOrganizationHandler({
      organizationRepository: orgs,
      settingsRepository: settings,
      eventPublisher: events,
    });
    const archiveOrg = new ArchiveOrganizationHandler({
      organizationRepository: orgs,
      settingsRepository: settings,
      eventPublisher: events,
    });
    const getOrg = new GetOrganizationHandler({
      organizationRepository: orgs,
      settingsRepository: settings,
      eventPublisher: events,
    });
    const createProject = new CreateProjectHandler({
      projectRepository: projects,
      organizationRepository: orgs,
      eventPublisher: events,
      defaultOwnerId: "owner-1",
    });
    const getProject = new GetProjectHandler({
      projectRepository: projects,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    const createPortfolio = new CreatePortfolioHandler({
      portfolioRepository: portfolios,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    const createKnowledge = new CreateKnowledgeArticleHandler({
      articleRepository: articles,
      categoryRepository: categories,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    const searchKnowledge = new SearchKnowledgeHandler({
      articleRepository: articles,
    });
    const findInvoices = new FindInvoicesHandler({
      invoiceRepository: invoices,
    });
    const listAssets = new ListAssetsHandler({ assetRepository: assets });

    executor = new UseCaseExecutor({
      unitOfWork: uow,
      eventDispatcher: dispatcher,
      authorization: new AllowAllAuthorization(),
    });
    executor.registerCommandHandler(createOrg as never);
    executor.registerCommandHandler(archiveOrg as never);
    executor.registerCommandHandler(createProject as never);
    executor.registerCommandHandler(createPortfolio as never);
    executor.registerCommandHandler(createKnowledge as never);
    executor.registerQueryHandler(getOrg as never);
    executor.registerQueryHandler(getProject as never);
    executor.registerQueryHandler(searchKnowledge as never);
    executor.registerQueryHandler(findInvoices as never);
    executor.registerQueryHandler(listAssets as never);
  });

  it("creates organization via handler", async () => {
    const result = await executor.executeCommand(
      createOrganizationCommand({ name: "New Co", slug: "new-co" }),
      ctx,
      {
        permission: "organization.create",
        collectDomainEvents: () => events.drain(),
      },
    );
    expect((result.data as { slug: string }).slug).toBe("new-co");
    expect(uow.committed).toBe(1);
    expect(dispatcher.events.length).toBeGreaterThan(0);
  });

  it("rejects create organization without name", async () => {
    await expect(
      executor.executeCommand(
        createOrganizationCommand({ name: "" }),
        ctx,
      ),
    ).rejects.toThrow(ValidationError);
    expect(uow.rolledBack).toBe(1);
  });

  it("gets organization", async () => {
    const result = await executor.executeQuery(
      getOrganizationQuery(orgId),
      ctx,
      { permission: "organization.read" },
    );
    expect((result.data as { id: string }).id).toBe(orgId);
  });

  it("creates project", async () => {
    const result = await executor.executeCommand(
      createProjectCommand({ name: "Campaign" }),
      ctx,
      {
        permission: "project.create",
        collectDomainEvents: () => events.drain(),
      },
    );
    expect((result.data as { name: string }).name).toBe("Campaign");
    expect((result.data as { ownerId: string }).ownerId).toBe("owner-1");
  });

  it("gets project", async () => {
    const created = await executor.executeCommand(
      createProjectCommand({ name: "GetMe" }),
      ctx,
      { collectDomainEvents: () => events.drain() },
    );
    const id = (created.data as { id: string }).id;
    const got = await executor.executeQuery(getProjectQuery(id), ctx);
    expect((got.data as { name: string }).name).toBe("GetMe");
  });

  it("creates portfolio", async () => {
    const result = await executor.executeCommand(
      createPortfolioCommand({
        name: "Growth",
        startDate: "2026-01-01",
        portfolioNumber: "PFO-APP-1",
      }),
      ctx,
      {
        permission: "portfolio.create",
        collectDomainEvents: () => events.drain(),
      },
    );
    expect((result.data as { name: string }).name).toBe("Growth");
    expect((result.data as { portfolioNumber: string }).portfolioNumber).toBe(
      "PFO-APP-1",
    );
  });

  it("creates knowledge article after category seed", async () => {
    const cat = KnowledgeCategory.create({
      organizationId: orgId,
      name: "SOPs",
    });
    await categories.save(cat);
    const result = await executor.executeCommand(
      createKnowledgeArticleCommand({
        title: "Onboarding",
        categoryId: cat.id,
        articleNumber: "KNW-APP-1",
      }),
      ctx,
      {
        permission: "knowledge.create",
        collectDomainEvents: () => events.drain(),
      },
    );
    expect((result.data as { title: string }).title).toBe("Onboarding");
    expect((result.data as { status: string }).status).toBe("DRAFT");
  });

  it("searches knowledge by title", async () => {
    const cat = KnowledgeCategory.create({
      organizationId: orgId,
      name: "Docs",
    });
    await categories.save(cat);
    await executor.executeCommand(
      createKnowledgeArticleCommand({
        title: "Alpha Guide",
        categoryId: cat.id,
        articleNumber: "A1",
      }),
      ctx,
      { collectDomainEvents: () => events.drain() },
    );
    await executor.executeCommand(
      createKnowledgeArticleCommand({
        title: "Beta Guide",
        categoryId: cat.id,
        articleNumber: "B1",
      }),
      ctx,
      { collectDomainEvents: () => events.drain() },
    );
    const result = await executor.executeQuery(
      searchKnowledgeQuery({ titleContains: "alpha" }),
      ctx,
      { permission: "knowledge.search" },
    );
    expect(result.data as unknown[]).toHaveLength(1);
  });

  it("find invoices empty", async () => {
    const result = await executor.executeQuery(findInvoicesQuery(), ctx);
    expect(result.data).toEqual([]);
  });

  it("list assets empty", async () => {
    const result = await executor.executeQuery(listAssetsQuery(), ctx);
    expect(result.data).toEqual([]);
  });

  it("archives organization", async () => {
    const created = await executor.executeCommand(
      createOrganizationCommand({ name: "Temp", slug: "temp-arch" }),
      ctx,
      { collectDomainEvents: () => events.drain() },
    );
    const id = (created.data as { id: string }).id;
    const archived = await executor.executeCommand(
      archiveOrganizationCommand(id),
      ctx,
      {
        permission: "organization.archive",
        collectDomainEvents: () => events.drain(),
      },
    );
    expect((archived.data as { status: string }).status).toMatch(/ARCHIV/i);
  });

  it("knowledge category service still pure domain", async () => {
    const collector = new CollectingEventPublisher();
    const service = new KnowledgeCategoryService({
      categoryRepository: categories,
      articleRepository: articles,
      organizationRepository: orgs,
      eventPublisher: collector,
    });
    const cat = await service.create({
      organizationId: orgId,
      name: "Policies",
    });
    expect(cat.name.value).toBe("Policies");
  });
});
