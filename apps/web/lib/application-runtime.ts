import {
  CollectingEventPublisher,
  CreateProjectHandler,
  CreateCustomerHandler,
  AddContactHandler,
  CreateServiceHandler,
  CreateServiceCategoryHandler,
  ListServicesHandler,
  ListServiceCategoriesHandler,
  CreateQuoteHandler,
  IssueQuoteHandler,
  ListQuotesHandler,
  GetQuoteHandler,
  ListCustomersHandler,
  ListContactsHandler,
  DefaultAuthorizationService,
  GetOrganizationHandler,
  GetProjectHandler,
  ListProjectsHandler,
  UseCaseExecutor,
  createProjectCommand,
  createCustomerCommand,
  createServiceCommand,
  createServiceCategoryCommand,
  addContactCommand,
  getOrganizationQuery,
  getProjectQuery,
  listProjectsQuery,
  listCustomersQuery,
  listContactsQuery,
  listServicesQuery,
  listServiceCategoriesQuery,
  createQuoteCommand,
  issueQuoteCommand,
  listQuotesQuery,
  getQuoteQuery,
  type OrganizationDto,
  type ProjectDto,
  type CustomerDto,
  type ContactDto,
  type ServiceDto,
  type ServiceCategoryDto,
  type QuoteDto,
  type ApplicationContext,
} from "@creative-lab/application";
import {
  PostgresOrganizationMembershipRepository,
  PostgresOrganizationRepository,
  PostgresOrganizationSettingsRepository,
  PostgresProjectRepository,
  PostgresCustomerRepository,
  PostgresContactRepository,
  PostgresServiceRepository,
  PostgresCategoryRepository,
  PostgresQuoteRepository,
  PostgresQuoteVersionRepository,
  PostgresQuoteLineRepository,
  PostgresUnitOfWork,
  createPostgresDatabase,
  postgresConfigurationFromEnvironment,
  InMemoryEventDispatcher,
} from "@creative-lab/infrastructure";

let runtime: Promise<UseCaseExecutor> | undefined;

class MembershipReaderAdapter {
  constructor(private readonly repository: PostgresOrganizationMembershipRepository) {}

  async findMembership(actorId: string, organizationId: string) {
    return this.repository.findByActorAndOrganization(actorId, organizationId);
  }
}

async function createRuntime(): Promise<UseCaseExecutor> {
  const database = createPostgresDatabase(postgresConfigurationFromEnvironment());
  const organizationRepository = new PostgresOrganizationRepository(database.db);
  const settingsRepository = new PostgresOrganizationSettingsRepository(database.db);
  const membershipRepository = new PostgresOrganizationMembershipRepository(database.db);
  const projectRepository = new PostgresProjectRepository(database.db);
  const customerRepository = new PostgresCustomerRepository(database.db);
  const contactRepository = new PostgresContactRepository(database.db);
  const serviceRepository = new PostgresServiceRepository(database.db);
  const categoryRepository = new PostgresCategoryRepository(database.db);
  const quoteRepository = new PostgresQuoteRepository(database.db);
  const quoteVersionRepository = new PostgresQuoteVersionRepository(database.db);
  const quoteLineRepository = new PostgresQuoteLineRepository(database.db);
  const authorization = new DefaultAuthorizationService(
    new MembershipReaderAdapter(membershipRepository),
  );
  const unitOfWork = new PostgresUnitOfWork(database.client);
  const eventDispatcher = new InMemoryEventDispatcher();
  const eventPublisher = new CollectingEventPublisher();

  const executor = new UseCaseExecutor({
    unitOfWork,
    eventDispatcher,
    authorization,
  });

  executor.registerQueryHandler(
    new GetOrganizationHandler({
      organizationRepository,
      settingsRepository,
      eventPublisher,
    }),
  );

  executor.registerQueryHandler(
    new GetProjectHandler({
      projectRepository,
      organizationRepository,
      authorization,
      eventPublisher,
    }),
  );

  executor.registerQueryHandler(
    new ListProjectsHandler({
      projectRepository,
      organizationRepository,
      authorization,
      eventPublisher,
    }),
  );

  executor.registerCommandHandler(
    new CreateProjectHandler({
      projectRepository,
      organizationRepository,
      eventPublisher,
    }),
  );

  executor.registerQueryHandler(
    new ListCustomersHandler({
      customerRepository,
      organizationRepository,
      eventPublisher,
      authorization,
    }),
  );

  executor.registerQueryHandler(
    new ListContactsHandler({
      contactRepository,
      customerRepository,
      eventPublisher,
      authorization,
    }),
  );

  executor.registerCommandHandler(
    new CreateCustomerHandler({
      customerRepository,
      organizationRepository,
      eventPublisher,
    }),
  );

  executor.registerCommandHandler(
    new AddContactHandler({
      contactRepository,
      customerRepository,
      eventPublisher,
    }),
  );

  executor.registerQueryHandler(
    new ListServicesHandler({
      serviceRepository,
      categoryRepository,
      organizationRepository,
      eventPublisher,
      authorization,
    }),
  );

  executor.registerQueryHandler(
    new ListServiceCategoriesHandler({
      categoryRepository,
      serviceRepository,
      organizationRepository,
      eventPublisher,
      authorization,
    }),
  );

  executor.registerCommandHandler(
    new CreateServiceHandler({
      serviceRepository,
      categoryRepository,
      organizationRepository,
      eventPublisher,
    }),
  );

  executor.registerCommandHandler(
    new CreateServiceCategoryHandler({
      categoryRepository,
      serviceRepository,
      organizationRepository,
      eventPublisher,
    }),
  );

  executor.registerQueryHandler(
    new ListQuotesHandler({
      quoteRepository,
    }),
  );

  executor.registerQueryHandler(
    new GetQuoteHandler({
      quoteRepository,
    }),
  );

  executor.registerCommandHandler(
    new CreateQuoteHandler({
      quoteRepository,
      quoteVersionRepository,
      quoteLineRepository,
      organizationRepository,
      eventPublisher,
      customerRepository,
    }),
  );

  executor.registerCommandHandler(
    new IssueQuoteHandler({
      quoteRepository,
      quoteVersionRepository,
      quoteLineRepository,
      organizationRepository,
      eventPublisher,
    }),
  );

  return executor;
}

export function getApplicationRuntime(): Promise<UseCaseExecutor> {
  runtime ??= createRuntime();
  return runtime;
}

export async function getOrganization(
  context: ApplicationContext,
): Promise<OrganizationDto> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeQuery<OrganizationDto>(
    getOrganizationQuery(context.organizationId),
    context,
  );
  return result.data;
}

export async function getProject(
  projectId: string,
  context: ApplicationContext,
): Promise<ProjectDto> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeQuery<ProjectDto>(
    getProjectQuery(projectId),
    context,
  );
  return result.data;
}

export async function listProjects(
  context: ApplicationContext,
): Promise<ProjectDto[]> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeQuery<ProjectDto[]>(
    listProjectsQuery(),
    context,
  );
  return result.data;
}

export async function createProject(
  name: string,
  description: string | null,
  context: ApplicationContext,
): Promise<ProjectDto> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeCommand<ProjectDto>(
    createProjectCommand({ name, description }),
    context,
  );
  return result.data;
}

export async function listCustomers(
  context: ApplicationContext,
): Promise<CustomerDto[]> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeQuery<CustomerDto[]>(
    listCustomersQuery(),
    context,
  );
  return result.data;
}

export async function listContacts(
  customerId: string,
  context: ApplicationContext,
): Promise<ContactDto[]> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeQuery<ContactDto[]>(
    listContactsQuery(customerId),
    context,
  );
  return result.data;
}

export async function createCustomer(
  input: {
    name: string;
    customerNumber?: string;
    legalName?: string | null;
    industry?: string | null;
    billingAddress?: string | null;
  },
  context: ApplicationContext,
): Promise<CustomerDto> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeCommand<CustomerDto>(
    createCustomerCommand(input),
    context,
  );
  return result.data;
}

export async function addContact(
  input: {
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    role?: string | null;
    isPrimary?: boolean;
  },
  context: ApplicationContext,
): Promise<ContactDto> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeCommand<ContactDto>(
    addContactCommand(input),
    context,
  );
  return result.data;
}

export async function listServices(
  context: ApplicationContext,
): Promise<ServiceDto[]> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeQuery<ServiceDto[]>(listServicesQuery(), context);
  return result.data;
}

export async function listServiceCategories(
  context: ApplicationContext,
): Promise<ServiceCategoryDto[]> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeQuery<ServiceCategoryDto[]>(listServiceCategoriesQuery(), context);
  return result.data;
}

export async function createService(
  input: {
    serviceCode: string;
    name: string;
    description?: string | null;
    categoryId: string;
    defaultPriceBookId?: string | null;
    pricingModel?: string;
  },
  context: ApplicationContext,
): Promise<ServiceDto> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeCommand<ServiceDto>(createServiceCommand(input), context);
  return result.data;
}

export async function createServiceCategory(
  input: { name: string; description?: string | null },
  context: ApplicationContext,
): Promise<ServiceCategoryDto> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeCommand<ServiceCategoryDto>(createServiceCategoryCommand(input), context);
  return result.data;
}


export async function listQuotes(
  context: ApplicationContext,
  filters: { customerId?: string; status?: string } = {},
): Promise<QuoteDto[]> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeQuery<QuoteDto[]>(
    listQuotesQuery(filters),
    context,
  );
  return result.data;
}

export async function getQuote(
  quoteId: string,
  context: ApplicationContext,
): Promise<QuoteDto> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeQuery<QuoteDto>(
    getQuoteQuery(quoteId),
    context,
  );
  return result.data;
}

export async function createQuote(
  input: {
    customerId: string;
    currency?: string;
    quoteNumber?: string;
    validUntil?: Date | null;
  },
  context: ApplicationContext,
): Promise<QuoteDto> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeCommand<QuoteDto>(
    createQuoteCommand(input),
    context,
  );
  return result.data;
}

export async function issueQuote(
  quoteId: string,
  context: ApplicationContext,
): Promise<QuoteDto> {
  const executor = await getApplicationRuntime();
  const result = await executor.executeCommand<QuoteDto>(
    issueQuoteCommand(quoteId),
    context,
  );
  return result.data;
}
