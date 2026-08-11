import { DomainError } from "@creative-lab/core";

export class CustomerNotFoundError extends DomainError {
  readonly code = "CUSTOMER_NOT_FOUND";
  constructor(identifier: string) {
    super(`Customer not found: ${identifier}`);
  }
}

export class DuplicateCustomerNumberError extends DomainError {
  readonly code = "DUPLICATE_CUSTOMER_NUMBER";
  constructor(customerNumber: string, organizationId: string) {
    super(
      `Customer number "${customerNumber}" already exists in organization "${organizationId}".`,
    );
  }
}

export class ContactNotFoundError extends DomainError {
  readonly code = "CONTACT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Contact not found: ${identifier}`);
  }
}

export class DuplicatePrimaryContactError extends DomainError {
  readonly code = "DUPLICATE_PRIMARY_CONTACT";
  constructor(customerId: string) {
    super(
      `Customer "${customerId}" already has a primary contact.`,
    );
  }
}

export class DuplicateContactEmailError extends DomainError {
  readonly code = "DUPLICATE_CONTACT_EMAIL";
  constructor(email: string, customerId: string) {
    super(
      `Email "${email}" is already used for a contact on customer "${customerId}".`,
    );
  }
}

export class OpportunityNotFoundError extends DomainError {
  readonly code = "OPPORTUNITY_NOT_FOUND";
  constructor(identifier: string) {
    super(`Opportunity not found: ${identifier}`);
  }
}

export class InvalidOpportunityStateError extends DomainError {
  readonly code = "INVALID_OPPORTUNITY_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class InteractionNotFoundError extends DomainError {
  readonly code = "INTERACTION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Interaction not found: ${identifier}`);
  }
}

export class InvalidCustomerStateError extends DomainError {
  readonly code = "INVALID_CUSTOMER_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class CRMValidationError extends DomainError {
  readonly code = "CRM_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
