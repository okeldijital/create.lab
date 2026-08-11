import {
  OrganizationService,
  type OrganizationServiceDeps,
  asOrganizationId,
} from "@creative-lab/organization";
import type { ArchiveOrganizationCommand } from "../../commands/organization/ArchiveOrganizationCommand.js";
import type { OrganizationDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { OrganizationMapper } from "../../mappers/OrganizationMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type ArchiveOrganizationHandlerDeps = Omit<
  OrganizationServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
};

export class ArchiveOrganizationHandler
  implements CommandHandler<ArchiveOrganizationCommand, OrganizationDto>
{
  readonly commandType = "ArchiveOrganization" as const;
  private readonly service: OrganizationService;

  constructor(deps: ArchiveOrganizationHandlerDeps) {
    this.service = new OrganizationService(deps);
  }

  async handle(
    command: ArchiveOrganizationCommand,
    _context: ApplicationContext,
  ): Promise<OrganizationDto> {
    validateRequired(command, ["organizationId"]);
    const organization = await this.service.archive(
      asOrganizationId(command.organizationId),
    );
    return OrganizationMapper.toDto(organization);
  }
}
