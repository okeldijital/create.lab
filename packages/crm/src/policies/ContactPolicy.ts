import type { Contact } from "../aggregates/Contact/Contact.js";
import {
  DuplicateContactEmailError,
  DuplicatePrimaryContactError,
  InvalidCustomerStateError,
} from "../errors/CRMErrors.js";
import type { CustomerId } from "../types/ids.js";

export class ContactPolicy {
  static assertSinglePrimary(
    customerId: CustomerId,
    existing: readonly Contact[],
    makingPrimary: boolean,
  ): void {
    if (!makingPrimary) return;
    const current = existing.find(
      (c) => c.isPrimary && !c.isArchived,
    );
    if (current) {
      throw new DuplicatePrimaryContactError(customerId);
    }
  }

  static assertUniqueEmail(
    customerId: CustomerId,
    email: string,
    existing: readonly Contact[],
    excludeContactId?: string,
  ): void {
    const normalized = email.trim().toLowerCase();
    const dup = existing.find(
      (c) =>
        c.email.value === normalized &&
        !c.isArchived &&
        c.id !== excludeContactId,
    );
    if (dup) {
      throw new DuplicateContactEmailError(normalized, customerId);
    }
  }

  static assertNotArchived(contact: Contact): void {
    if (contact.isArchived) {
      throw new InvalidCustomerStateError(
        "Archived contacts are immutable.",
      );
    }
  }
}
