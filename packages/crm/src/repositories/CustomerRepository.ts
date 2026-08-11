import type { OrganizationId } from "@creative-lab/organization";
import type { Customer } from "../aggregates/Customer/Customer.js";
import type { CustomerStatus } from "../enums/CustomerStatus.js";
import type { CustomerId } from "../types/ids.js";

export interface CustomerRepository {
  findById(id: CustomerId): Promise<Customer | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Customer[]>;
  findByStatus(status: CustomerStatus): Promise<Customer[]>;
  findByCustomerNumber(
    organizationId: OrganizationId,
    customerNumber: string,
  ): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
  update(customer: Customer): Promise<void>;
  archive(id: CustomerId): Promise<void>;
  exists(id: CustomerId): Promise<boolean>;
}
