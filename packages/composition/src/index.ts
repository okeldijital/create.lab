export {
  createApplicationComposition,
  executeCommand,
  registerCommandHandler,
  registerQueryHandler,
} from "./ApplicationComposition.js";
export type { ApplicationComposition, ApplicationCompositionOptions } from "./ApplicationComposition.js";
export { RepositoryRegistry } from "./RepositoryRegistry.js";
export {
  ORGANIZATION_REPOSITORY_KEYS,
  registerPostgresOrganizationRepositories,
} from "./OrganizationPersistenceComposition.js";
export {
  CRM_REPOSITORY_KEYS,
  registerPostgresCrmRepositories,
} from "./CrmPersistenceComposition.js";
export {
  WORKFORCE_REPOSITORY_KEYS,
  registerPostgresWorkforceRepositories,
} from "./WorkforcePersistenceComposition.js";
export {
  SERVICES_REPOSITORY_KEYS,
  registerPostgresServicesRepositories,
} from "./ServicesPersistenceComposition.js";
export {
  QUOTATION_REPOSITORY_KEYS,
  registerPostgresQuotationRepositories,
} from "./QuotationPersistenceComposition.js";
export {
  CONTRACTS_REPOSITORY_KEYS,
  registerPostgresContractsRepositories,
} from "./ContractsPersistenceComposition.js";
export {
  KNOWLEDGE_REPOSITORY_KEYS,
  registerPostgresKnowledgeRepositories,
} from "./KnowledgePersistenceComposition.js";
