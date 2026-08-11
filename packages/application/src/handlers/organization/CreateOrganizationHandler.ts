import {
  OrganizationService,
  type OrganizationServiceDeps,
} from "@creative-lab/organization";
import type { CreateOrganizationCommand } from "../../commands/organization/CreateOrganizationCommand.js";
import type { OrganizationDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { OrganizationMapper } from "../../mappers/OrganizationMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CreateOrganizationHandlerDeps = Omit<
  OrganizationServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
};

export class CreateOrganizationHandler
  implements CommandHandler<CreateOrganizationCommand, OrganizationDto>
{
  readonly commandType = "CreateOrganization" as const;
  private readonly service: OrganizationService;

  constructor(deps: CreateOrganizationHandlerDeps) {
    this.service = new OrganizationService(deps);
  }

  async handle(
    command: CreateOrganizationCommand,
    _context: ApplicationContext,
  ): Promise<OrganizationDto> {
    validateRequired(command, ["name"]);
    const { organization } = await this.service.create({
      name: command.name,
      slug: command.slug,
      displayName: command.displayName,
      legalName: command.legalName,
      description: command.description,
      timezone: command.timezone,
      locale: command.locale,
      currency: command.currency,
    });
    return OrganizationMapper.toDto(organization);
  }
}
