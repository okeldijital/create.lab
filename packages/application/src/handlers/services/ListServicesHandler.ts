import {
  ServiceService,
  type ServiceServiceDeps,
} from "@creative-lab/services";
import type { ServiceDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { ServiceMapper } from "../../mappers/ServiceMapper.js";
import type { ListServicesQuery } from "../../queries/ListServicesQuery.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import type { AuthorizationService } from "../../authorization/AuthorizationService.js";

export type ListServicesHandlerDeps = Omit<ServiceServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
  authorization: AuthorizationService;
};

export class ListServicesHandler
  implements QueryHandler<ListServicesQuery, ServiceDto[]>
{
  readonly queryType = "ListServices" as const;
  private readonly service: ServiceService;
  private readonly authorization: AuthorizationService;

  constructor(deps: ListServicesHandlerDeps) {
    const { authorization, ...serviceDeps } = deps;
    this.service = new ServiceService(serviceDeps);
    this.authorization = authorization;
  }

  async handle(
    _query: ListServicesQuery,
    context: ApplicationContext,
  ): Promise<ServiceDto[]> {
    await this.authorization.assertCan("service.read", context);
    const services = await this.service.listByOrganization(context.organizationId);
    return services
      .filter((service) => String(service.organizationId) === String(context.organizationId))
      .map(ServiceMapper.toDto);
  }
}
