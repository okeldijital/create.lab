import type { Customer } from "@creative-lab/crm";
import type { CustomerDto } from "../dto/common.js";

export class CustomerMapper {
  static toDto(customer: Customer): CustomerDto {
    return {
      id: customer.id,
      organizationId: customer.organizationId,
      customerNumber: customer.customerNumber.value,
      name: customer.name.value,
      legalName: customer.legalName.value,
      status: customer.status,
      industry: customer.industry.value,
      billingAddress: customer.billingAddress.value,
    };
  }
}
