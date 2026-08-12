export {
  createApplicationComposition,
  executeCommand,
  registerCommandHandler,
  registerQueryHandler,
} from "./ApplicationComposition.js";
export type { ApplicationComposition, ApplicationCompositionOptions } from "./ApplicationComposition.js";
export { RepositoryRegistry } from "./RepositoryRegistry.js";
export { ORGANIZATION_REPOSITORY_KEYS, registerPostgresOrganizationRepositories } from "./OrganizationPersistenceComposition.js";
export { CRM_REPOSITORY_KEYS, registerPostgresCrmRepositories } from "./CrmPersistenceComposition.js";
export { WORKFORCE_REPOSITORY_KEYS, registerPostgresWorkforceRepositories } from "./WorkforcePersistenceComposition.js";
export { CAPACITY_REPOSITORY_KEYS, registerPostgresCapacityRepositories } from "./CapacityPersistenceComposition.js";
