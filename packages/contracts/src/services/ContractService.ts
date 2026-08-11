import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  Contract,
  type CreateContractProps,
} from "../aggregates/Contract/Contract.js";
import { ContractVersion } from "../aggregates/ContractVersion/ContractVersion.js";
import { ContractStatus } from "../enums/ContractStatus.js";
import {
  ContractNotFoundError,
  ContractVersionNotFoundError,
  DuplicateContractNumberError,
  InvalidContractStateError,
} from "../errors/ContractErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ContractLifecyclePolicy } from "../policies/ContractLifecyclePolicy.js";
import { TermPolicy } from "../policies/TermPolicy.js";
import type { ContractRepository } from "../repositories/ContractRepository.js";
import type { ContractTermRepository } from "../repositories/ContractTermRepository.js";
import type { ContractVersionRepository } from "../repositories/ContractVersionRepository.js";
import type { ContractId } from "../types/ids.js";
import { ContractNumber } from "../value-objects/ContractNumber.js";

export type ContractServiceDeps = {
  contractRepository: ContractRepository;
  contractVersionRepository: ContractVersionRepository;
  contractTermRepository: ContractTermRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class ContractService {
  constructor(private readonly deps: ContractServiceDeps) {}

  async create(props: CreateContractProps): Promise<Contract> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }

    const contract = Contract.create(props);
    const existing = await this.deps.contractRepository.findByContractNumber(
      props.organizationId,
      contract.contractNumber.value,
    );
    if (existing) {
      throw new DuplicateContractNumberError(
        contract.contractNumber.value,
        props.organizationId,
      );
    }

    const version = ContractVersion.create({
      organizationId: props.organizationId,
      contractId: contract.id,
      versionNumber: 1,
    });
    contract.setCurrentVersion(version.id);

    await this.deps.contractRepository.save(contract);
    await this.deps.contractVersionRepository.save(version);
    await this.deps.eventPublisher.publish([
      ...contract.pullDomainEvents(),
      ...version.pullDomainEvents(),
    ]);
    return contract;
  }

  async markPendingSignature(
    id: ContractId,
    now?: Date,
  ): Promise<Contract> {
    const contract = await this.getById(id);
    ContractLifecyclePolicy.assertCanTransition(
      contract,
      ContractStatus.PENDING_SIGNATURE,
    );
    contract.markPendingSignature(now);
    await this.deps.contractRepository.update(contract);
    await this.deps.eventPublisher.publish(contract.pullDomainEvents());
    return contract;
  }

  async activate(id: ContractId, now?: Date): Promise<Contract> {
    const contract = await this.getById(id);

    if (!contract.currentVersionId) {
      throw new InvalidContractStateError(
        "Contract has no current version.",
      );
    }
    const version = await this.deps.contractVersionRepository.findById(
      contract.currentVersionId,
    );
    if (!version) {
      throw new ContractVersionNotFoundError(contract.currentVersionId);
    }
    const terms = await this.deps.contractTermRepository.findByVersion(
      version.id,
    );
    TermPolicy.assertHasMandatoryWhenActivating(terms);

    // DRAFT must pass through PENDING_SIGNATURE before ACTIVE
    if (contract.isDraft) {
      ContractLifecyclePolicy.assertCanTransition(
        contract,
        ContractStatus.PENDING_SIGNATURE,
      );
      contract.markPendingSignature(now);
    }
    ContractLifecyclePolicy.assertCanActivate(contract);
    version.lock(now);
    contract.activate(now);

    await this.deps.contractVersionRepository.update(version);
    await this.deps.contractRepository.update(contract);
    await this.deps.eventPublisher.publish([
      ...version.pullDomainEvents(),
      ...contract.pullDomainEvents(),
    ]);
    return contract;
  }

  async expire(id: ContractId, now?: Date): Promise<Contract> {
    const contract = await this.getById(id);
    ContractLifecyclePolicy.assertCanTransition(
      contract,
      ContractStatus.EXPIRED,
    );
    contract.expire(now);
    await this.deps.contractRepository.update(contract);
    await this.deps.eventPublisher.publish(contract.pullDomainEvents());
    return contract;
  }

  async terminate(id: ContractId, now?: Date): Promise<Contract> {
    const contract = await this.getById(id);
    ContractLifecyclePolicy.assertCanTransition(
      contract,
      ContractStatus.TERMINATED,
    );
    contract.terminate(now);
    await this.deps.contractRepository.update(contract);
    await this.deps.eventPublisher.publish(contract.pullDomainEvents());
    return contract;
  }

  async archive(id: ContractId, now?: Date): Promise<Contract> {
    const contract = await this.getById(id);
    ContractLifecyclePolicy.assertCanTransition(
      contract,
      ContractStatus.ARCHIVED,
    );
    contract.archive(now);
    await this.deps.contractRepository.archive(id);
    await this.deps.contractRepository.update(contract);
    await this.deps.eventPublisher.publish(contract.pullDomainEvents());
    return contract;
  }

  async getById(id: ContractId): Promise<Contract> {
    const contract = await this.deps.contractRepository.findById(id);
    if (!contract) throw new ContractNotFoundError(id);
    return contract;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Contract[]> {
    return this.deps.contractRepository.findByOrganization(organizationId);
  }

  async findByContractNumber(
    organizationId: OrganizationId,
    contractNumber: string,
  ): Promise<Contract | null> {
    return this.deps.contractRepository.findByContractNumber(
      organizationId,
      ContractNumber.create(contractNumber).value,
    );
  }
}
