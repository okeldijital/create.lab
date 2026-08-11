/**
 * @creative-lab/infrastructure
 *
 * BUILD-002 infrastructure foundation. Concrete technical adapters live here;
 * domain and application packages depend only on their ports.
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
