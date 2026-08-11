import type { Customer } from "../aggregates/Customer/Customer.js";
import {
  CustomerStatus,
  canTransitionCustomer,
} from "../enums/CustomerStatus.js";
import { InvalidCustomerStateError } from "../errors/CRMErrors.js";

export class CustomerLifecyclePolicy {
  static assertCanTransition(customer: Customer, to: CustomerStatus): void {
    if (customer.isArchived) {
      throw new InvalidCustomerStateError(
        "Archived customers are immutable.",
      );
    }
    if (!canTransitionCustomer(customer.status, to)) {
      throw new InvalidCustomerStateError(
        `Illegal customer transition: ${customer.status} → ${to}.`,
      );
    }
  }

  static assertMutable(customer: Customer): void {
    if (customer.isArchived) {
      throw new InvalidCustomerStateError(
        "Archived customers are immutable.",
      );
    }
  }

  static assertCanArchive(customer: Customer): void {
    CustomerLifecyclePolicy.assertCanTransition(
      customer,
      CustomerStatus.ARCHIVED,
    );
  }

  static assertCanRestore(customer: Customer): void {
    if (customer.status !== CustomerStatus.INACTIVE) {
      throw new InvalidCustomerStateError(
        `Only INACTIVE customers can be restored (status: ${customer.status}).`,
      );
    }
  }
}
