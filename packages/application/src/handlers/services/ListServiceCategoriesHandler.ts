import {
  CategoryService,
  type CategoryServiceDeps,
} from "@creative-lab/services";
import type { ServiceCategoryDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { ServiceCategoryMapper } from "../../mappers/ServiceCategoryMapper.js";
import type { ListServiceCategoriesQuery } from "../../queries/ListServiceCategoriesQuery.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import type { AuthorizationService } from "../../authorization/AuthorizationService.js";

export type ListServiceCategoriesHandlerDeps = Omit<CategoryServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
  authorization: AuthorizationService;
};

export class ListServiceCategoriesHandler
  implements QueryHandler<ListServiceCategoriesQuery, ServiceCategoryDto[]>
{
  readonly queryType = "ListServiceCategories" as const;
  private readonly service: CategoryService;
  private readonly authorization: AuthorizationService;

  constructor(deps: ListServiceCategoriesHandlerDeps) {
    const { authorization, ...serviceDeps } = deps;
    this.service = new CategoryService(serviceDeps);
    this.authorization = authorization;
  }

  async handle(
    _query: ListServiceCategoriesQuery,
    context: ApplicationContext,
  ): Promise<ServiceCategoryDto[]> {
    await this.authorization.assertCan("service.read", context);
    const categories = await this.service.listByOrganization(context.organizationId);
    return categories
      .filter((category) => String(category.organizationId) === String(context.organizationId))
      .map(ServiceCategoryMapper.toDto);
  }
}
