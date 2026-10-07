import { DeliveryService, type DeliveryServiceDeps } from "@creative-lab/delivery";
import type { DeliveryDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import type { ListDeliveriesQuery } from "../../queries/ListDeliveriesQuery.js";
import type { ApplicationContext } from "../../types/context.js";

export type ListDeliveriesHandlerDeps = Omit<DeliveryServiceDeps, "eventPublisher"> & {
  eventPublisher: DeliveryServiceDeps["eventPublisher"];
};

export class ListDeliveriesHandler implements QueryHandler<ListDeliveriesQuery, DeliveryDto[]> {
  readonly queryType = "ListDeliveries" as const;
  private readonly service: DeliveryService;

  constructor(deps: ListDeliveriesHandlerDeps) {
    this.service = new DeliveryService(deps);
  }

  async handle(query: ListDeliveriesQuery, context: ApplicationContext): Promise<DeliveryDto[]> {
    const deliveries = query.projectId
      ? await this.service.listByProject(query.projectId as never)
      : await this.service.listByOrganization(context.organizationId);

    return deliveries
      .filter((delivery) => String(delivery.organizationId) === String(context.organizationId))
      .map((delivery) => ({
        id: delivery.id,
        organizationId: delivery.organizationId,
        status: delivery.status,
        projectId: delivery.projectId,
      }));
  }
}
