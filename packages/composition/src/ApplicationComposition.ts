import type {
  ApplicationContext,
  AuthorizationService,
  Command,
  CommandHandler,
  CommandResult,
  EventDispatcher,
  QueryHandler,
  UnitOfWork,
  UseCaseExecutor,
} from "@creative-lab/application";
import { UseCaseExecutor as Executor } from "@creative-lab/application";
import {
  createInfrastructureConfiguration,
  InMemoryAuthorizationService,
  InMemoryEventDispatcher,
  InMemoryUnitOfWork,
  type InfrastructureConfiguration,
} from "@creative-lab/infrastructure";
import { RepositoryRegistry } from "./RepositoryRegistry.js";

export type ApplicationCompositionOptions = Readonly<{
  configuration?: InfrastructureConfiguration;
  unitOfWork?: UnitOfWork;
  eventDispatcher?: EventDispatcher;
  authorization?: AuthorizationService;
}>;

export type ApplicationComposition = Readonly<{
  configuration: InfrastructureConfiguration;
  unitOfWork: UnitOfWork;
  eventDispatcher: EventDispatcher;
  authorization: AuthorizationService;
  executor: UseCaseExecutor;
  repositories: RepositoryRegistry;
}>;

/**
 * Composition root for BUILD-003.
 *
 * Concrete infrastructure implementations are assembled here and injected
 * into the BUILD-001 application executor. Neither domain nor application
 * code imports this package.
 */
export function createApplicationComposition(
  options: ApplicationCompositionOptions = {},
): ApplicationComposition {
  const configuration =
    options.configuration ?? createInfrastructureConfiguration();
  const unitOfWork = options.unitOfWork ?? new InMemoryUnitOfWork();
  const eventDispatcher =
    options.eventDispatcher ?? new InMemoryEventDispatcher();
  const authorization =
    options.authorization ?? new InMemoryAuthorizationService();

  const executor = new Executor({
    unitOfWork,
    eventDispatcher,
    authorization,
  });

  return Object.freeze({
    configuration,
    unitOfWork,
    eventDispatcher,
    authorization,
    executor,
    repositories: new RepositoryRegistry(),
  });
}

export function registerCommandHandler(
  composition: ApplicationComposition,
  handler: CommandHandler,
): void {
  composition.executor.registerCommandHandler(handler);
}

export function registerQueryHandler(
  composition: ApplicationComposition,
  handler: QueryHandler,
): void {
  composition.executor.registerQueryHandler(handler);
}

export async function executeCommand<TResult>(
  composition: ApplicationComposition,
  command: Command,
  context: ApplicationContext,
  options?: Parameters<UseCaseExecutor["executeCommand"]>[2],
): Promise<CommandResult<TResult>> {
  return composition.executor.executeCommand<TResult>(command, context, options);
}
