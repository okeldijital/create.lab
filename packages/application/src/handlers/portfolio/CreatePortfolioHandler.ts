import {
  PortfolioService,
  type PortfolioServiceDeps,
} from "@creative-lab/portfolio";
import type { CreatePortfolioCommand } from "../../commands/portfolio/CreatePortfolioCommand.js";
import type { PortfolioDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { PortfolioMapper } from "../../mappers/PortfolioMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CreatePortfolioHandlerDeps = Omit<
  PortfolioServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
};

export class CreatePortfolioHandler
  implements CommandHandler<CreatePortfolioCommand, PortfolioDto>
{
  readonly commandType = "CreatePortfolio" as const;
  private readonly service: PortfolioService;

  constructor(deps: CreatePortfolioHandlerDeps) {
    this.service = new PortfolioService(deps);
  }

  async handle(
    command: CreatePortfolioCommand,
    context: ApplicationContext,
  ): Promise<PortfolioDto> {
    validateRequired(command, ["name", "startDate"]);
    const portfolio = await this.service.create({
      organizationId: context.organizationId,
      name: command.name,
      description: command.description,
      portfolioNumber: command.portfolioNumber,
      startDate: new Date(command.startDate),
      targetEndDate: command.targetEndDate
        ? new Date(command.targetEndDate)
        : null,
    });
    return PortfolioMapper.toDto(portfolio);
  }
}
