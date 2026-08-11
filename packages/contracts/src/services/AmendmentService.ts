import {
  ContractAmendment,
  type CreateContractAmendmentProps,
} from "../aggregates/ContractAmendment/ContractAmendment.js";
import { ContractTerm } from "../aggregates/ContractTerm/ContractTerm.js";
import { ContractVersion } from "../aggregates/ContractVersion/ContractVersion.js";
import {
  ContractAmendmentNotFoundError,
  ContractNotFoundError,
  ContractVersionNotFoundError,
} from "../errors/ContractErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { AmendmentPolicy } from "../policies/AmendmentPolicy.js";
import { VersionPolicy } from "../policies/VersionPolicy.js";
import type { ContractAmendmentRepository } from "../repositories/ContractAmendmentRepository.js";
import type { ContractRepository } from "../repositories/ContractRepository.js";
import type { ContractTermRepository } from "../repositories/ContractTermRepository.js";
import type { ContractVersionRepository } from "../repositories/ContractVersionRepository.js";
import type { ContractAmendmentId, ContractId } from "../types/ids.js";

export type AmendmentServiceDeps = {
  contractAmendmentRepository: ContractAmendmentRepository;
  contractRepository: ContractRepository;
  contractVersionRepository: ContractVersionRepository;
  contractTermRepository: ContractTermRepository;
  eventPublisher: DomainEventPublisher;
};

export class AmendmentService {
  constructor(private readonly deps: AmendmentServiceDeps) {}

  async create(
    props: CreateContractAmendmentProps,
  ): Promise<ContractAmendment> {
    const contract = await this.deps.contractRepository.findById(
      props.contractId,
    );
    if (!contract) throw new ContractNotFoundError(props.contractId);
    AmendmentPolicy.assertCanCreate(contract);

    const amendment = ContractAmendment.create(props);
    await this.deps.contractAmendmentRepository.save(amendment);
    await this.deps.eventPublisher.publish(amendment.pullDomainEvents());
    return amendment;
  }

  async approve(
    id: ContractAmendmentId,
    now?: Date,
  ): Promise<ContractAmendment> {
    const amendment = await this.getById(id);
    AmendmentPolicy.assertCanApprove(amendment);
    amendment.approve(now);
    await this.deps.contractAmendmentRepository.update(amendment);
    await this.deps.eventPublisher.publish(amendment.pullDomainEvents());
    return amendment;
  }

  /**
   * Apply approved amendment: clone current terms into a new version and promote it.
   */
  async apply(
    id: ContractAmendmentId,
    now?: Date,
  ): Promise<{ amendment: ContractAmendment; version: ContractVersion }> {
    const amendment = await this.getById(id);
    AmendmentPolicy.assertCanApply(amendment);

    const contract = await this.deps.contractRepository.findById(
      amendment.contractId,
    );
    if (!contract) throw new ContractNotFoundError(amendment.contractId);
    if (!contract.currentVersionId) {
      throw new ContractVersionNotFoundError("none");
    }

    const current = await this.deps.contractVersionRepository.findById(
      contract.currentVersionId,
    );
    if (!current) {
      throw new ContractVersionNotFoundError(contract.currentVersionId);
    }

    const existing = await this.deps.contractVersionRepository.findByContract(
      contract.id,
    );
    const nextNumber = VersionPolicy.nextVersionNumber(existing);
    const newVersion = ContractVersion.create({
      organizationId: contract.organizationId,
      contractId: contract.id,
      versionNumber: nextNumber,
      now,
    });

    const sourceTerms = await this.deps.contractTermRepository.findByVersion(
      current.id,
    );
    for (const source of sourceTerms) {
      const clone = ContractTerm.create({
        organizationId: source.organizationId,
        contractVersionId: newVersion.id,
        title: source.title.value,
        description: source.description.value,
        mandatory: source.mandatory,
        order: source.order,
        now,
      });
      newVersion.addTermId(clone.id, now);
      await this.deps.contractTermRepository.save(clone);
    }

    current.supersede(now);
    newVersion.promote(current.id, now);
    newVersion.lock(now);
    contract.setCurrentVersion(newVersion.id, now);
    amendment.apply(newVersion.id, now);

    await this.deps.contractVersionRepository.update(current);
    await this.deps.contractVersionRepository.save(newVersion);
    await this.deps.contractRepository.update(contract);
    await this.deps.contractAmendmentRepository.update(amendment);

    await this.deps.eventPublisher.publish([
      ...current.pullDomainEvents(),
      ...newVersion.pullDomainEvents(),
      ...amendment.pullDomainEvents(),
      ...contract.pullDomainEvents(),
    ]);
    return { amendment, version: newVersion };
  }

  async getById(id: ContractAmendmentId): Promise<ContractAmendment> {
    const amendment = await this.deps.contractAmendmentRepository.findById(id);
    if (!amendment) throw new ContractAmendmentNotFoundError(id);
    return amendment;
  }

  async listByContract(contractId: ContractId): Promise<ContractAmendment[]> {
    return this.deps.contractAmendmentRepository.findByContract(contractId);
  }
}
