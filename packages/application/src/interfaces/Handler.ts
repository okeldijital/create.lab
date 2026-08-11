import type { Command } from "../commands/Command.js";
import type { Query } from "../queries/Query.js";
import type { ApplicationContext } from "../types/context.js";

export interface CommandHandler<
  TCommand extends Command = Command,
  TResult = unknown,
> {
  readonly commandType: TCommand["type"];
  handle(
    command: TCommand,
    context: ApplicationContext,
  ): Promise<TResult>;
}

export interface QueryHandler<
  TQuery extends Query = Query,
  TResult = unknown,
> {
  readonly queryType: TQuery["type"];
  handle(query: TQuery, context: ApplicationContext): Promise<TResult>;
}
