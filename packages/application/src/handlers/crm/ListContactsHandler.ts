import {
  ContactService,
  asCustomerId,
  type ContactServiceDeps,
} from "@creative-lab/crm";
import type { ContactDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { ContactMapper } from "../../mappers/ContactMapper.js";
import type { ListContactsQuery } from "../../queries/ListContactsQuery.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import type { AuthorizationService } from "../../authorization/AuthorizationService.js";

export type ListContactsHandlerDeps = Omit<ContactServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
  authorization: AuthorizationService;
};

export class ListContactsHandler
  implements QueryHandler<ListContactsQuery, ContactDto[]>
{
  readonly queryType = "ListContacts" as const;
  private readonly service: ContactService;
  private readonly authorization: AuthorizationService;

  constructor(deps: ListContactsHandlerDeps) {
    const { authorization, ...serviceDeps } = deps;
    this.service = new ContactService(serviceDeps);
    this.authorization = authorization;
  }

  async handle(
    query: ListContactsQuery,
    context: ApplicationContext,
  ): Promise<ContactDto[]> {
    await this.authorization.assertCan("contact.read", context);
    const contacts = await this.service.listByCustomer(asCustomerId(query.customerId));
    return contacts
      .filter((contact) => String(contact.organizationId) === String(context.organizationId))
      .map(ContactMapper.toDto);
  }
}
