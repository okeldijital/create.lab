import {
  CategoryService,
  type CategoryServiceDeps,
} from "@creative-lab/services";
import type { CreateServiceCategoryCommand } from "../../commands/services/CreateServiceCategoryCommand.js";
import type { ServiceCategoryDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { ServiceCategoryMapper } from "../../mappers/ServiceCategoryMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CreateServiceCategoryHandlerDeps = Omit<CategoryServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
};

export class CreateServiceCategoryHandler
  implements CommandHandler<CreateServiceCategoryCommand, ServiceCategoryDto>
{
  readonly commandType = "CreateServiceCategory" as const;
  private readonly service: CategoryService;

  constructor(deps: CreateServiceCategoryHandlerDeps) {
    this.service = new CategoryService(deps);
  }

  async handle(
    command: CreateServiceCategoryCommand,
    context: ApplicationContext,
  ): Promise<ServiceCategoryDto> {
    validateRequired(command, ["name"]);
    const category = await this.service.create({
      organizationId: context.organizationId,
      name: command.name,
      description: command.description,
    });
    return ServiceCategoryMapper.toDto(category);
  }
}
