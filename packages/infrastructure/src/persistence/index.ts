export type {
  PostgresConfiguration,
} from "./PostgresConfiguration.js";
export { postgresConfigurationFromEnvironment } from "./PostgresConfiguration.js";
export type {
  PostgresClient,
  DrizzleDatabase,
  PostgresDatabase,
} from "./PostgresDatabase.js";
export {
  createPostgresDatabase,
  checkPostgresConnection,
} from "./PostgresDatabase.js";
export { PostgresUnitOfWork } from "./PostgresUnitOfWork.js";

export {
  organizations,
  departments,
  teams,
  studios,
  organizationSettings,
  organizationSchema,
  OrganizationMapper,
  DepartmentMapper,
  TeamMapper,
  StudioMapper,
  OrganizationSettingsMapper,
  PostgresOrganizationRepository,
  PostgresDepartmentRepository,
  PostgresTeamRepository,
  PostgresStudioRepository,
  PostgresOrganizationSettingsRepository,
} from "./organization/index.js";

export {
  customers,
  contacts,
  opportunities,
  interactions,
  crmSchema,
  CustomerMapper,
  ContactMapper,
  OpportunityMapper,
  InteractionMapper,
  PostgresCustomerRepository,
  PostgresContactRepository,
  PostgresOpportunityRepository,
  PostgresInteractionRepository,
} from "./crm/index.js";

export {
  positions,
  workers,
  employments,
  employmentContracts,
  reportingRelationships,
  workforceSchema,
  PositionMapper,
  WorkerMapper,
  EmploymentMapper,
  EmploymentContractMapper,
  ReportingRelationshipMapper,
  PostgresPositionRepository,
  PostgresWorkerRepository,
  PostgresEmploymentRepository,
  PostgresEmploymentContractRepository,
  PostgresReportingRelationshipRepository,
} from "./workforce/index.js";

export {
  serviceCategories,
  services,
  priceBooks,
  priceRules,
  servicesSchema,
  ServiceMapper,
  ServiceCategoryMapper,
  PriceBookMapper,
  PriceRuleMapper,
  PostgresServiceRepository,
  PostgresCategoryRepository,
  PostgresPriceBookRepository,
  PostgresPriceRuleRepository,
} from "./services/index.js";

export {
  quotes,
  quoteVersions,
  quoteLines,
  quoteApprovals,
  quotationSchema,
  QuoteMapper,
  QuoteVersionMapper,
  QuoteLineMapper,
  QuoteApprovalMapper,
  PostgresQuoteRepository,
  PostgresQuoteVersionRepository,
  PostgresQuoteLineRepository,
  PostgresQuoteApprovalRepository,
} from "./quotation/index.js";
