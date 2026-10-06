import {
  ServiceService,
  type ServiceServiceDeps,
  asServiceCategoryId,
  asPriceBookId,
  PricingModel,
} from "@creative-lab/services";
import type { CreateServiceCommand } from "../../commands/services/CreateServiceCommand.js";
import type { ServiceDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { ServiceMapper } from "../../mappers/ServiceMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CreateServiceHandlerDeps = Omit<ServiceServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
};

export class CreateServiceHandler
  implements CommandHandler<CreateServiceCommand, ServiceDto>
{
  readonly commandType = "CreateService" as const;
  private readonly service: ServiceService;

  constructor(deps: CreateServiceHandlerDeps) {
    this.service = new ServiceService(deps);
  }

  async handle(
    command: CreateServiceCommand,
    context: ApplicationContext,
  ): Promise<ServiceDto> {
    validateRequired(command, ["serviceCode", "name", "categoryId"]);
    const service = await this.service.create({
      organizationId: context.organizationId,
      serviceCode: command.serviceCode,
      name: command.name,
      description: command.description,
      categoryId: asServiceCategoryId(command.categoryId),
      defaultPriceBookId: command.defaultPriceBookId
        ? asPriceBookId(command.defaultPriceBookId)
        : null,
      pricingModel: command.pricingModel
        ? command.pricingModel as PricingModel
        : PricingModel.FIXED,
    });
    return ServiceMapper.toDto(service);
  }
}
