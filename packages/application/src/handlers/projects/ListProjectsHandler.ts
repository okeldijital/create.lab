import {
  ProjectService,
  type ProjectServiceDeps,
} from "@creative-lab/projects";
import type { AuthorizationService } from "../../authorization/AuthorizationService.js";
import type { ProjectDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { ProjectMapper } from "../../mappers/ProjectMapper.js";
import type { ListProjectsQuery } from "../../queries/ListProjectsQuery.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";

export type ListProjectsHandlerDeps = Omit<
  ProjectServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
  authorization: AuthorizationService;
};

export class ListProjectsHandler
  implements QueryHandler<ListProjectsQuery, ProjectDto[]>
{
  readonly queryType = "ListProjects" as const;
  private readonly service: ProjectService;
  private readonly authorization: AuthorizationService;

  constructor(deps: ListProjectsHandlerDeps) {
    const { authorization, ...serviceDeps } = deps;
    this.service = new ProjectService(serviceDeps);
    this.authorization = authorization;
  }

  async handle(
    _query: ListProjectsQuery,
    context: ApplicationContext,
  ): Promise<ProjectDto[]> {
    await this.authorization.assertCan("project.read", context);

    const projects = await this.service.listByOrganization(
      context.organizationId,
    );

    return projects
      .filter(
        (project) =>
          String(project.organizationId) === String(context.organizationId),
      )
      .map((project) => ProjectMapper.toDto(project));
  }
}
