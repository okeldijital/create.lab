/**
 * @creative-lab/infrastructure
 *
 * Concrete technical adapters live here; domain and application packages
 * depend only on their ports. BUILD-004 adds the PostgreSQL/Drizzle
 * persistence foundation without introducing domain-specific schemas.
 */
export { InMemoryUnitOfWork } from "./unit-of-work/InMemoryUnitOfWork.js";
export { InMemoryEventDispatcher } from "./events/InMemoryEventDispatcher.js";
export { InMemoryAuthorizationService } from "./authorization/InMemoryAuthorizationService.js";
export { InMemoryRepository } from "./repositories/InMemoryRepository.js";
export type { InfrastructureEntity } from "./repositories/InMemoryRepository.js";
export { createInfrastructureConfiguration } from "./configuration/InfrastructureConfiguration.js";
export type {
  InfrastructureConfiguration,
  InfrastructureMode,
} from "./configuration/InfrastructureConfiguration.js";
export {
  InfrastructureError,
  TransactionError,
  RepositoryError,
  EventDispatchError,
  AuthorizationAdapterError,
} from "./errors/InfrastructureErrors.js";
export * from "./persistence/index.js";
