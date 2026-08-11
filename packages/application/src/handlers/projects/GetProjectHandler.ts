import {
  ProjectService,
  type ProjectServiceDeps,
  asProjectId,
} from "@creative-lab/projects";
import type { ProjectDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { ProjectMapper } from "../../mappers/ProjectMapper.js";
import type { GetProjectQuery } from "../../queries/GetProjectQuery.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateQueryRequired } from "../../validators/QueryValidator.js";

export type GetProjectHandlerDeps = Omit<
  ProjectServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
};

export class GetProjectHandler
  implements QueryHandler<GetProjectQuery, ProjectDto>
{
  readonly queryType = "GetProject" as const;
  private readonly service: ProjectService;

  constructor(deps: GetProjectHandlerDeps) {
    this.service = new ProjectService(deps);
  }

  async handle(
    query: GetProjectQuery,
    _context: ApplicationContext,
  ): Promise<ProjectDto> {
    validateQueryRequired(query, ["projectId"]);
    const project = await this.service.getById(asProjectId(query.projectId));
    return ProjectMapper.toDto(project);
  }
}
