import { ContractVersion } from "../aggregates/ContractVersion/ContractVersion.js";
import {
  ContractNotFoundError,
  ContractVersionNotFoundError,
} from "../errors/ContractErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ContractLifecyclePolicy } from "../policies/ContractLifecyclePolicy.js";
import { VersionPolicy } from "../policies/VersionPolicy.js";
import type { ContractRepository } from "../repositories/ContractRepository.js";
import type { ContractTermRepository } from "../repositories/ContractTermRepository.js";
import type { ContractVersionRepository } from "../repositories/ContractVersionRepository.js";
import type { ContractId, ContractVersionId } from "../types/ids.js";

export type VersionServiceDeps = {
  contractVersionRepository: ContractVersionRepository;
  contractRepository: ContractRepository;
  contractTermRepository: ContractTermRepository;
  eventPublisher: DomainEventPublisher;
};

export class VersionService {
  constructor(private readonly deps: VersionServiceDeps) {}

  /**
   * Create a new version for draft contracts (supersedes previous).
   * For active contracts, use AmendmentService.apply.
   */
  async createVersion(
    contractId: ContractId,
    now?: Date,
  ): Promise<ContractVersion> {
    const contract = await this.deps.contractRepository.findById(contractId);
    if (!contract) throw new ContractNotFoundError(contractId);
    ContractLifecyclePolicy.assertDraftOrPending(contract);

    const existing = await this.deps.contractVersionRepository.findByContract(
      contractId,
    );
    const nextNumber = VersionPolicy.nextVersionNumber(existing);
    const previous = existing.find((v) => v.isCurrent) ?? null;

    const version = ContractVersion.create({
      organizationId: contract.organizationId,
      contractId,
      versionNumber: nextNumber,
      now,
    });

    if (previous) {
      previous.supersede(now);
      await this.deps.contractVersionRepository.update(previous);
    }
    version.promote(previous?.id ?? null, now);
    contract.setCurrentVersion(version.id, now);

    await this.deps.contractVersionRepository.save(version);
    await this.deps.contractRepository.update(contract);
    await this.deps.eventPublisher.publish([
      ...version.pullDomainEvents(),
      ...(previous?.pullDomainEvents() ?? []),
      ...contract.pullDomainEvents(),
    ]);
    return version;
  }

  async getById(id: ContractVersionId): Promise<ContractVersion> {
    const version = await this.deps.contractVersionRepository.findById(id);
    if (!version) throw new ContractVersionNotFoundError(id);
    return version;
  }

  async getCurrent(contractId: ContractId): Promise<ContractVersion | null> {
    return this.deps.contractVersionRepository.findCurrentVersion(contractId);
  }

  async listByContract(contractId: ContractId): Promise<ContractVersion[]> {
    return this.deps.contractVersionRepository.findByContract(contractId);
  }
}
