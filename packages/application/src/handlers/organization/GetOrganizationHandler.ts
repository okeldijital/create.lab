import {
  OrganizationService,
  type OrganizationServiceDeps,
  asOrganizationId,
} from "@creative-lab/organization";
import type { OrganizationDto } from "../../dto/common.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { OrganizationMapper } from "../../mappers/OrganizationMapper.js";
import type { GetOrganizationQuery } from "../../queries/GetOrganizationQuery.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateQueryRequired } from "../../validators/QueryValidator.js";

export type GetOrganizationHandlerDeps = Omit<
  OrganizationServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
};

export class GetOrganizationHandler
  implements QueryHandler<GetOrganizationQuery, OrganizationDto>
{
  readonly queryType = "GetOrganization" as const;
  private readonly service: OrganizationService;

  constructor(deps: GetOrganizationHandlerDeps) {
    this.service = new OrganizationService(deps);
  }

  async handle(
    query: GetOrganizationQuery,
    context: ApplicationContext,
  ): Promise<OrganizationDto> {
    validateQueryRequired(query, ["organizationId"]);

    if (query.organizationId !== context.organizationId) {
      throw new AuthorizationError();
    }

    const organization = await this.service.getById(
      asOrganizationId(context.organizationId),
    );
    return OrganizationMapper.toDto(organization);
  }
}
