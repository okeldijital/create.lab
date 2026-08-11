import {
  Interaction,
  type CreateInteractionProps,
} from "../aggregates/Interaction/Interaction.js";
import {
  CustomerNotFoundError,
  InteractionNotFoundError,
} from "../errors/CRMErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { InteractionPolicy } from "../policies/InteractionPolicy.js";
import type { ContactRepository } from "../repositories/ContactRepository.js";
import type { CustomerRepository } from "../repositories/CustomerRepository.js";
import type { InteractionRepository } from "../repositories/InteractionRepository.js";
import type { CustomerId, InteractionId } from "../types/ids.js";

export type InteractionServiceDeps = {
  interactionRepository: InteractionRepository;
  customerRepository: CustomerRepository;
  contactRepository: ContactRepository;
  eventPublisher: DomainEventPublisher;
};

export class InteractionService {
  constructor(private readonly deps: InteractionServiceDeps) {}

  async record(props: CreateInteractionProps): Promise<Interaction> {
    const customer = await this.deps.customerRepository.findById(
      props.customerId,
    );
    if (!customer) throw new CustomerNotFoundError(props.customerId);
    InteractionPolicy.assertCustomerActive(customer);

    const contactId = props.contactId ?? null;
    const contact = contactId
      ? await this.deps.contactRepository.findById(contactId)
      : null;
    InteractionPolicy.assertContactBelongsToCustomer(
      contact,
      customer,
      contactId,
    );

    const interaction = Interaction.create(props);
    await this.deps.interactionRepository.save(interaction);
    await this.deps.eventPublisher.publish(interaction.pullDomainEvents());
    return interaction;
  }

  async getById(id: InteractionId): Promise<Interaction> {
    const interaction = await this.deps.interactionRepository.findById(id);
    if (!interaction) throw new InteractionNotFoundError(id);
    return interaction;
  }

  async history(customerId: CustomerId): Promise<Interaction[]> {
    const list = await this.deps.interactionRepository.findByCustomer(
      customerId,
    );
    return list.sort(
      (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
    );
  }
}
