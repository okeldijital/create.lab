import {
  CollectingEventPublisher,
  CreateProjectHandler,
  CreateCustomerHandler,
  AddContactHandler,
  ListCustomersHandler,
  ListContactsHandler,
  DefaultAuthorizationService,
  GetOrganizationHandler,
  GetProjectHandler,
  ListProjectsHandler,
  UseCaseExecutor,
  createProjectCommand,
  getOrganizationQuery,
  getProjectQuery,
  listProjectsQuery,
  listCustomersQuery,
  listContactsQuery,
  type OrganizationDto,
  type ProjectDto,
  type CustomerDto,
  type ContactDto,
  type ApplicationContext,
} from "@creative-lab/application";
import {
  PostgresOrganizationMembershipRepository,
  PostgresOrganizationRepository,
  PostgresOrganizationSettingsRepository,
  PostgresProjectRepository,
  PostgresCustomerRepository,
  PostgresContactRepository,
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
