import { EmploymentContract } from "../aggregates/EmploymentContract/EmploymentContract.js";
import type { CreateEmploymentContractProps } from "../aggregates/EmploymentContract/EmploymentContract.js";
import {
  ContractConflictError,
  ContractNotFoundError,
  EmploymentNotFoundError,
} from "../errors/WorkforceErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import type { EmploymentContractRepository } from "../repositories/EmploymentContractRepository.js";
import type { EmploymentRepository } from "../repositories/EmploymentRepository.js";
import type { EmploymentContractId, EmploymentId } from "../types/ids.js";

export type EmploymentContractServiceDeps = {
  contractRepository: EmploymentContractRepository;
  employmentRepository: EmploymentRepository;
  eventPublisher: DomainEventPublisher;
};

export class EmploymentContractService {
  constructor(private readonly deps: EmploymentContractServiceDeps) {}

  async create(
    props: CreateEmploymentContractProps,
  ): Promise<EmploymentContract> {
    const employment = await this.deps.employmentRepository.findById(
      props.employmentId,
    );
    if (!employment) {
      throw new EmploymentNotFoundError(props.employmentId);
    }
    if (employment.organizationId !== props.organizationId) {
      throw new EmploymentNotFoundError(
        "Employment organization mismatch for contract.",
      );
    }
    if (!employment.isActive) {
      throw new ContractConflictError(
        "Cannot create a contract for inactive employment.",
      );
    }

    const active = await this.deps.contractRepository.findActiveByEmployment(
      props.employmentId,
    );
    if (active) {
      throw new ContractConflictError(
        `Employment already has active contract "${active.id}".`,
      );
    }

    const contract = EmploymentContract.create(props);
    await this.deps.contractRepository.save(contract);
    await this.deps.eventPublisher.publish(contract.pullDomainEvents());
    return contract;
  }

  async getById(id: EmploymentContractId): Promise<EmploymentContract> {
    const contract = await this.deps.contractRepository.findById(id);
    if (!contract) throw new ContractNotFoundError(id);
    return contract;
  }

  async listByEmployment(
    employmentId: EmploymentId,
  ): Promise<EmploymentContract[]> {
    return this.deps.contractRepository.findByEmployment(employmentId);
  }

  async expire(
    id: EmploymentContractId,
    at?: Date,
    now?: Date,
  ): Promise<EmploymentContract> {
    const contract = await this.getById(id);
    contract.expire(at, now);
    await this.deps.contractRepository.update(contract);
    await this.deps.eventPublisher.publish(contract.pullDomainEvents());
    return contract;
  }
}
