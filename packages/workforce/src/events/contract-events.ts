import type { OrganizationId } from "@creative-lab/organization";
import type { ContractStatus } from "../enums/ContractStatus.js";
import type { ContractType } from "../enums/ContractType.js";
import type { EmploymentContractId, EmploymentId } from "../types/ids.js";
import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";

export class ContractCreated extends DomainEvent<
  "ContractCreated",
  Readonly<{
    contractId: string;
    employmentId: string;
    contractType: ContractType;
    effectiveDate: string;
    status: ContractStatus;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    contractId: EmploymentContractId;
    employmentId: EmploymentId;
    contractType: ContractType;
    effectiveDate: Date;
    status: ContractStatus;
    occurredAt?: Date;
  }): ContractCreated {
    return new ContractCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.contractId,
      organizationId: input.organizationId,
      payload: {
        contractId: input.contractId,
        employmentId: input.employmentId,
        contractType: input.contractType,
        effectiveDate: input.effectiveDate.toISOString(),
        status: input.status,
      },
    });
  }
}

export class ContractExpired extends DomainEvent<
  "ContractExpired",
  Readonly<{
    contractId: string;
    employmentId: string;
    expiryDate: string;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    contractId: EmploymentContractId;
    employmentId: EmploymentId;
    expiryDate: Date;
    occurredAt?: Date;
  }): ContractExpired {
    return new ContractExpired({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractExpired",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.contractId,
      organizationId: input.organizationId,
      payload: {
        contractId: input.contractId,
        employmentId: input.employmentId,
        expiryDate: input.expiryDate.toISOString(),
      },
    });
  }
}
