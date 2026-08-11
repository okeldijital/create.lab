import type { AnyDomainEvent } from "@creative-lab/core";
import type { AuthorizationService } from "../authorization/AuthorizationService.js";
import type { Command } from "../commands/Command.js";
import type { CommandResult } from "../commands/Command.js";
import {
  AuthorizationError,
  HandlerNotFoundError,
  TransactionError,
} from "../errors/ApplicationErrors.js";
import type { EventDispatcher } from "../events/EventDispatcher.js";
import type { CommandHandler, QueryHandler } from "../interfaces/Handler.js";
import type { Query } from "../queries/Query.js";
import type { QueryResult } from "../queries/Query.js";
import type { UnitOfWork } from "../transactions/UnitOfWork.js";
import type { ApplicationContext } from "../types/context.js";
import type { Permission } from "../types/ids.js";
import { toIntegrationEvents } from "../utils/index.js";

export type UseCaseExecutorDeps = {
  unitOfWork: UnitOfWork;
  eventDispatcher: EventDispatcher;
  authorization: AuthorizationService;
};

/**
 * Coordinates validation, authorization, transactions, handler execution,
 * and event publication. Contains no domain business rules.
 */
export class UseCaseExecutor {
  private readonly commandHandlers = new Map<
    string,
    CommandHandler<Command, unknown>
  >();
  private readonly queryHandlers = new Map<
    string,
    QueryHandler<Query, unknown>
  >();

  constructor(private readonly deps: UseCaseExecutorDeps) {}

  registerCommandHandler(handler: CommandHandler<Command, unknown>): void {
    this.commandHandlers.set(handler.commandType, handler);
  }

  registerQueryHandler(handler: QueryHandler<Query, unknown>): void {
    this.queryHandlers.set(handler.queryType, handler);
  }

  async executeCommand<TResult>(
    command: Command,
    context: ApplicationContext,
    options?: {
      permission?: Permission;
      collectDomainEvents?: () => readonly AnyDomainEvent[];
    },
  ): Promise<CommandResult<TResult>> {
    if (options?.permission) {
      await this.deps.authorization.assertCan(options.permission, context);
    }

    const handler = this.commandHandlers.get(command.type);
    if (!handler) {
      throw new HandlerNotFoundError(command.type);
    }

    await this.deps.unitOfWork.begin();
    try {
      const data = (await handler.handle(command, context)) as TResult;
      const domainEvents = options?.collectDomainEvents?.() ?? [];
      const integration = toIntegrationEvents(
        domainEvents,
        context.correlationId,
      );
      if (integration.length > 0) {
        await this.deps.eventDispatcher.publishMany(integration);
      }
      await this.deps.unitOfWork.commit();
      return { data, eventsPublished: integration.length };
    } catch (error) {
      if (this.deps.unitOfWork.isActive()) {
        try {
          await this.deps.unitOfWork.rollback();
        } catch (rollbackError) {
          throw new TransactionError(
            `Rollback failed: ${String(rollbackError)}; original: ${String(error)}`,
          );
        }
      }
      throw error;
    }
  }

  async executeQuery<TResult>(
    query: Query,
    context: ApplicationContext,
    options?: { permission?: Permission },
  ): Promise<QueryResult<TResult>> {
    if (options?.permission) {
      const allowed = await this.deps.authorization.can(
        options.permission,
        context,
      );
      if (!allowed) {
        throw new AuthorizationError();
      }
    }

    const handler = this.queryHandlers.get(query.type);
    if (!handler) {
      throw new HandlerNotFoundError(query.type);
    }

    const data = (await handler.handle(query, context)) as TResult;
    return { data };
  }
}
