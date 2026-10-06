import {
  ContactService,
  asCustomerId,
  type ContactServiceDeps,
} from "@creative-lab/crm";
import type { AddContactCommand } from "../../commands/crm/AddContactCommand.js";
import type { ContactDto } from "../../dto/common.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { ContactMapper } from "../../mappers/ContactMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type AddContactHandlerDeps = Omit<ContactServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
};

export class AddContactHandler
  implements CommandHandler<AddContactCommand, ContactDto>
{
  readonly commandType = "AddContact" as const;
  private readonly service: ContactService;
  private readonly customerRepository: ContactServiceDeps["customerRepository"];

  constructor(deps: AddContactHandlerDeps) {
    this.service = new ContactService(deps);
    this.customerRepository = deps.customerRepository;
  }

  async handle(
    command: AddContactCommand,
    context: ApplicationContext,
  ): Promise<ContactDto> {
    validateRequired(command, ["customerId", "firstName", "lastName", "email"]);
    const customer = await this.customerRepository.findById(
      asCustomerId(command.customerId),
    );
    if (!customer || String(customer.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }

    const contact = await this.service.add({
      organizationId: context.organizationId,
      customerId: asCustomerId(command.customerId),
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      phone: command.phone,
      role: command.role,
      isPrimary: command.isPrimary,
    });
    return ContactMapper.toDto(contact);
  }
}
