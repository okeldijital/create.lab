import {
  ProductionService,
  type ProductionServiceDeps,
  asProductionId,
} from "@creative-lab/production";
import type { StartProductionCommand } from "../../commands/production/StartProductionCommand.js";
import type { ProductionDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { ProductionMapper } from "../../mappers/ProductionMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type StartProductionHandlerDeps = Omit<
  ProductionServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
};

export class StartProductionHandler
  implements CommandHandler<StartProductionCommand, ProductionDto>
{
  readonly commandType = "StartProduction" as const;
  private readonly service: ProductionService;

  constructor(deps: StartProductionHandlerDeps) {
    this.service = new ProductionService(deps);
  }

  async handle(
    command: StartProductionCommand,
    _context: ApplicationContext,
  ): Promise<ProductionDto> {
    validateRequired(command, ["productionId"]);
    const production = await this.service.start(
      asProductionId(command.productionId),
    );
    return ProductionMapper.toDto(production);
  }
}
