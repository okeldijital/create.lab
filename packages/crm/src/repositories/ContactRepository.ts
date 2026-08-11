import type { Contact } from "../aggregates/Contact/Contact.js";
import type { ContactId, CustomerId } from "../types/ids.js";

export interface ContactRepository {
  findById(id: ContactId): Promise<Contact | null>;
  findByCustomer(customerId: CustomerId): Promise<Contact[]>;
  findPrimaryContact(customerId: CustomerId): Promise<Contact | null>;
  save(contact: Contact): Promise<void>;
  update(contact: Contact): Promise<void>;
  archive(id: ContactId): Promise<void>;
  exists(id: ContactId): Promise<boolean>;
}
