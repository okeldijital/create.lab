import type { Contact } from "@creative-lab/crm";
import type { ContactDto } from "../dto/common.js";

export class ContactMapper {
  static toDto(contact: Contact): ContactDto {
    return {
      id: contact.id,
      organizationId: contact.organizationId,
      customerId: contact.customerId,
      firstName: contact.firstName.value,
      lastName: contact.lastName.value,
      email: contact.email.value,
      phone: contact.phone.value,
      role: contact.role.value,
      isPrimary: contact.isPrimary,
      status: contact.status,
    };
  }
}
