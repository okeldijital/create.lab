import {
  ProjectService,
  type ProjectServiceDeps,
} from "@creative-lab/projects";
import type { CreateProjectCommand } from "../../commands/projects/CreateProjectCommand.js";
import type { ProjectDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { ProjectMapper } from "../../mappers/ProjectMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CreateProjectHandlerDeps = Omit<
  ProjectServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
  /** Application may supply owner from actor when command omits it. */
  defaultOwnerId?: string;
};

export class CreateProjectHandler
  implements CommandHandler<CreateProjectCommand, ProjectDto>
{
  readonly commandType = "CreateProject" as const;
  private readonly service: ProjectService;
  private readonly defaultOwnerId: string;

  constructor(deps: CreateProjectHandlerDeps) {
    const { defaultOwnerId, ...serviceDeps } = deps;
    this.service = new ProjectService(serviceDeps);
    this.defaultOwnerId = defaultOwnerId ?? "system";
  }

  async handle(
    command: CreateProjectCommand,
    context: ApplicationContext,
  ): Promise<ProjectDto> {
    validateRequired(command, ["name"]);
    const project = await this.service.create({
      organizationId: context.organizationId,
      name: command.name,
      description: command.description,
      ownerId: this.defaultOwnerId,
      startDate: command.startDate ? new Date(command.startDate) : null,
      targetEndDate: command.targetEndDate
        ? new Date(command.targetEndDate)
        : null,
    });
    return ProjectMapper.toDto(project);
  }
}
