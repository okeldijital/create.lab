import {
  ProjectService,
  type ProjectServiceDeps,
  asProjectId,
} from "@creative-lab/projects";
import type { ProjectDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import type { AuthorizationService } from "../../authorization/AuthorizationService.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
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
  authorization: AuthorizationService;
};

export class GetProjectHandler
  implements QueryHandler<GetProjectQuery, ProjectDto>
{
  readonly queryType = "GetProject" as const;
  private readonly service: ProjectService;
  private readonly authorization: AuthorizationService;

  constructor(deps: GetProjectHandlerDeps) {
    const { authorization, ...serviceDeps } = deps;
    this.service = new ProjectService(serviceDeps);
    this.authorization = authorization;
  }

  async handle(
    query: GetProjectQuery,
    context: ApplicationContext,
  ): Promise<ProjectDto> {
    validateQueryRequired(query, ["projectId"]);
    await this.authorization.assertCan("project.read", context);

    const project = await this.service.getById(asProjectId(query.projectId));
    if (String(project.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }

    return ProjectMapper.toDto(project);
  }
}
