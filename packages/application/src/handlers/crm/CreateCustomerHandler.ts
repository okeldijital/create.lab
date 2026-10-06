import {
  CustomerService,
  type CustomerServiceDeps,
} from "@creative-lab/crm";
import type { CreateCustomerCommand } from "../../commands/crm/CreateCustomerCommand.js";
import type { CustomerDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { CustomerMapper } from "../../mappers/CustomerMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CreateCustomerHandlerDeps = Omit<CustomerServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
};

export class CreateCustomerHandler
  implements CommandHandler<CreateCustomerCommand, CustomerDto>
{
  readonly commandType = "CreateCustomer" as const;
  private readonly service: CustomerService;

  constructor(deps: CreateCustomerHandlerDeps) {
    this.service = new CustomerService(deps);
  }

  async handle(
    command: CreateCustomerCommand,
    context: ApplicationContext,
  ): Promise<CustomerDto> {
    validateRequired(command, ["name"]);
    const customer = await this.service.create({
      organizationId: context.organizationId,
      name: command.name,
      customerNumber: command.customerNumber,
      legalName: command.legalName,
      industry: command.industry,
      billingAddress: command.billingAddress,
    });
    return CustomerMapper.toDto(customer);
  }
}
