import {
  ContactService,
  asCustomerId,
  type ContactServiceDeps,
} from "@creative-lab/crm";
import type { AddContactCommand } from "../../commands/crm/AddContactCommand.js";
import type { ContactDto } from "../../dto/common.js";
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

  constructor(deps: AddContactHandlerDeps) {
    this.service = new ContactService(deps);
  }

  async handle(
    command: AddContactCommand,
    context: ApplicationContext,
  ): Promise<ContactDto> {
    validateRequired(command, ["customerId", "firstName", "lastName", "email"]);
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
