/**
 * @creative-lab/application
 *
 * Application Layer — BUILD-001.
 * Use-case orchestration, DTO mapping, authorization/transaction/event ports.
 * No domain business rules; no persistence, transport, or UI.
 */

export type { Command, CommandResult } from "./commands/index.js";
export {
  createOrganizationCommand,
  archiveOrganizationCommand,
  createProjectCommand,
  startProductionCommand,
  createInvoiceCommand,
  createQuoteCommand,
  issueQuoteCommand,
  activateContractCommand,
  createEngagementCommand,
  createPortfolioCommand,
  createKnowledgeArticleCommand,
  createAssetCommand,
  approveReviewCommand,
  deliverProjectCommand,
} from "./commands/index.js";
export type {
  CreateOrganizationCommand,
  ArchiveOrganizationCommand,
  CreateProjectCommand,
  StartProductionCommand,
  CreateInvoiceCommand,
  CreateQuoteCommand,
  IssueQuoteCommand,
  ActivateContractCommand,
  CreateEngagementCommand,
  CreatePortfolioCommand,
  CreateKnowledgeArticleCommand,
  CreateAssetCommand,
  ApproveReviewCommand,
  DeliverProjectCommand,
} from "./commands/index.js";

export type { Query, QueryResult } from "./queries/index.js";
export {
  getProjectQuery,
  findInvoicesQuery,
  searchKnowledgeQuery,
  listAssetsQuery,
  getOrganizationQuery,
} from "./queries/index.js";
export type {
  GetProjectQuery,
  FindInvoicesQuery,
  SearchKnowledgeQuery,
  ListAssetsQuery,
  GetOrganizationQuery,
} from "./queries/index.js";

export type {
  OrganizationDto,
  ProjectDto,
  InvoiceDto,
  QuoteDto,
  ContractDto,
  EngagementDto,
  PortfolioDto,
  KnowledgeArticleDto,
  AssetDto,
  ProductionDto,
  ReviewDto,
  DeliveryDto,
} from "./dto/index.js";

export {
  OrganizationMapper,
  ProjectMapper,
  InvoiceMapper,
  QuoteMapper,
  ContractMapper,
  EngagementMapper,
  PortfolioMapper,
  KnowledgeMapper,
  AssetMapper,
  ProductionMapper,
  ReviewMapper,
  DeliveryMapper,
} from "./mappers/index.js";

export type { UnitOfWork } from "./transactions/index.js";
export type { EventDispatcher } from "./events/index.js";
export type { IntegrationEvent } from "./events/index.js";
export { INTEGRATION_EVENT_VERSION } from "./events/index.js";
export type { AuthorizationService } from "./authorization/index.js";

export type { CommandHandler, QueryHandler } from "./interfaces/index.js";

export {
  UseCaseExecutor,
  CollectingEventPublisher,
  CommercialOrchestrationService,
} from "./services/index.js";
export type {
  UseCaseExecutorDeps,
  CommercialOrchestrationDeps,
  ActivateCommercialChainInput,
  ActivateCommercialChainResult,
} from "./services/index.js";

export {
  CreateOrganizationHandler,
  ArchiveOrganizationHandler,
  GetOrganizationHandler,
  CreateProjectHandler,
  GetProjectHandler,
  CreatePortfolioHandler,
  CreateKnowledgeArticleHandler,
  SearchKnowledgeHandler,
  StartProductionHandler,
  IssueQuoteHandler,
  ActivateContractHandler,
  FindInvoicesHandler,
  ListAssetsHandler,
} from "./handlers/index.js";

export {
  ApplicationError,
  ValidationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ConcurrencyError,
  TransactionError,
  HandlerNotFoundError,
} from "./errors/index.js";

export type { CommandValidator, QueryValidator, FieldError } from "./validators/index.js";
export {
  RequiredFieldsCommandValidator,
  RequiredFieldsQueryValidator,
  validateRequired,
  validateQueryRequired,
} from "./validators/index.js";

export type { ApplicationContext, ActorId, Permission } from "./types/index.js";
export { asActorId } from "./types/index.js";

export {
  newCorrelationId,
  toIntegrationEvent,
  toIntegrationEvents,
} from "./utils/index.js";

export type {
  OrganizationRepository,
  ProjectRepository,
  InvoiceRepository,
  QuoteRepository,
  ContractRepository,
  EngagementRepository,
  PortfolioRepository,
  KnowledgeArticleRepository,
  AssetRepository,
  ProductionRepository,
  ReviewRepository,
  DeliveryRepository,
} from "./ports/index.js";
