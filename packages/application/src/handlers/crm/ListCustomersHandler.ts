import {
  CustomerService,
  type CustomerServiceDeps,
} from "@creative-lab/crm";
import type { CustomerDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { CustomerMapper } from "../../mappers/CustomerMapper.js";
import type { ListCustomersQuery } from "../../queries/ListCustomersQuery.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import type { AuthorizationService } from "../../authorization/AuthorizationService.js";

export type ListCustomersHandlerDeps = Omit<CustomerServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
  authorization: AuthorizationService;
};

export class ListCustomersHandler
  implements QueryHandler<ListCustomersQuery, CustomerDto[]>
{
  readonly queryType = "ListCustomers" as const;
  private readonly service: CustomerService;
  private readonly authorization: AuthorizationService;

  constructor(deps: ListCustomersHandlerDeps) {
    const { authorization, ...serviceDeps } = deps;
    this.service = new CustomerService(serviceDeps);
    this.authorization = authorization;
  }

  async handle(
    _query: ListCustomersQuery,
    context: ApplicationContext,
  ): Promise<CustomerDto[]> {
    await this.authorization.assertCan("customer.read", context);
    const customers = await this.service.listByOrganization(context.organizationId);
    return customers
      .filter((customer) => String(customer.organizationId) === String(context.organizationId))
      .map(CustomerMapper.toDto);
  }
}
