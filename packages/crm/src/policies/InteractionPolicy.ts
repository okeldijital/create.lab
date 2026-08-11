import type { Contact } from "../aggregates/Contact/Contact.js";
import type { Customer } from "../aggregates/Customer/Customer.js";
import { CRMValidationError } from "../errors/CRMErrors.js";
import type { ContactId } from "../types/ids.js";

export class InteractionPolicy {
  static assertCustomerActive(customer: Customer): void {
    if (customer.isArchived) {
      throw new CRMValidationError(
        "Cannot record interactions for archived customers.",
      );
    }
  }

  static assertContactBelongsToCustomer(
    contact: Contact | null,
    customer: Customer,
    contactId: ContactId | null | undefined,
  ): void {
    if (!contactId) return;
    if (!contact) {
      throw new CRMValidationError(
        `Contact ${contactId} not found for interaction.`,
      );
    }
    if (contact.customerId !== customer.id) {
      throw new CRMValidationError(
        "Interaction contact must belong to the customer.",
      );
    }
    if (contact.isArchived) {
      throw new CRMValidationError(
        "Cannot record interactions for archived contacts.",
      );
    }
  }
}
