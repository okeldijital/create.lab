import {
  ContractTerm,
  type CreateContractTermProps,
} from "../aggregates/ContractTerm/ContractTerm.js";
import {
  ContractNotFoundError,
  ContractTermNotFoundError,
  ContractVersionNotFoundError,
} from "../errors/ContractErrors.js";
import { ContractTermRemoved } from "../events/contract-events.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ContractLifecyclePolicy } from "../policies/ContractLifecyclePolicy.js";
import { TermPolicy } from "../policies/TermPolicy.js";
import { VersionPolicy } from "../policies/VersionPolicy.js";
import type { ContractRepository } from "../repositories/ContractRepository.js";
import type { ContractTermRepository } from "../repositories/ContractTermRepository.js";
import type { ContractVersionRepository } from "../repositories/ContractVersionRepository.js";
import type { ContractTermId, ContractVersionId } from "../types/ids.js";

export type TermServiceDeps = {
  contractTermRepository: ContractTermRepository;
  contractVersionRepository: ContractVersionRepository;
  contractRepository: ContractRepository;
  eventPublisher: DomainEventPublisher;
};

export type AddTermProps = {
  organizationId: CreateContractTermProps["organizationId"];
  contractVersionId: ContractVersionId;
  title: string;
  description: string;
  mandatory?: boolean;
  order?: number;
  now?: Date;
};

export class TermService {
  constructor(private readonly deps: TermServiceDeps) {}

  async add(props: AddTermProps): Promise<ContractTerm> {
    const version = await this.deps.contractVersionRepository.findById(
      props.contractVersionId,
    );
    if (!version) {
      throw new ContractVersionNotFoundError(props.contractVersionId);
    }
    const contract = await this.deps.contractRepository.findById(
      version.contractId,
    );
    if (!contract) throw new ContractNotFoundError(version.contractId);
    ContractLifecyclePolicy.assertDraftOrPending(contract);
    VersionPolicy.assertEditable(version, true);

    const existing = await this.deps.contractTermRepository.findByVersion(
      version.id,
    );
    const order = props.order ?? TermPolicy.nextOrder(existing);
    TermPolicy.assertUniqueOrder(order, existing);

    const term = ContractTerm.create({
      organizationId: props.organizationId,
      contractVersionId: props.contractVersionId,
      title: props.title,
      description: props.description,
      mandatory: props.mandatory,
      order,
      now: props.now,
    });
    version.addTermId(term.id, props.now);

    await this.deps.contractTermRepository.save(term);
    await this.deps.contractVersionRepository.update(version);
    await this.deps.eventPublisher.publish([
      ...term.pullDomainEvents(),
      ...version.pullDomainEvents(),
    ]);
    return term;
  }

  async remove(termId: ContractTermId, now?: Date): Promise<void> {
    const term = await this.deps.contractTermRepository.findById(termId);
    if (!term) throw new ContractTermNotFoundError(termId);
    TermPolicy.assertCanRemove(term);

    const version = await this.deps.contractVersionRepository.findById(
      term.contractVersionId,
    );
    if (!version) {
      throw new ContractVersionNotFoundError(term.contractVersionId);
    }
    const contract = await this.deps.contractRepository.findById(
      version.contractId,
    );
    if (!contract) throw new ContractNotFoundError(version.contractId);
    ContractLifecyclePolicy.assertDraftOrPending(contract);
    VersionPolicy.assertEditable(version, true);

    version.removeTermId(termId, now);
    await this.deps.contractTermRepository.delete(termId);
    await this.deps.contractVersionRepository.update(version);

    const removed = ContractTermRemoved.create({
      organizationId: term.organizationId,
      termId,
      versionId: version.id,
      occurredAt: now,
    });
    await this.deps.eventPublisher.publish([
      removed,
      ...version.pullDomainEvents(),
    ]);
  }

  async reorder(
    versionId: ContractVersionId,
    orderedTermIds: readonly ContractTermId[],
    now?: Date,
  ): Promise<ContractTerm[]> {
    const version = await this.deps.contractVersionRepository.findById(
      versionId,
    );
    if (!version) throw new ContractVersionNotFoundError(versionId);
    const contract = await this.deps.contractRepository.findById(
      version.contractId,
    );
    if (!contract) throw new ContractNotFoundError(version.contractId);
    ContractLifecyclePolicy.assertDraftOrPending(contract);
    VersionPolicy.assertEditable(version, true);

    const terms = await this.deps.contractTermRepository.findByVersion(
      versionId,
    );
    const byId = new Map(terms.map((t) => [t.id, t]));
    let order = 1;
    for (const id of orderedTermIds) {
      const term = byId.get(id);
      if (!term) throw new ContractTermNotFoundError(id);
      term.setOrder(order);
      await this.deps.contractTermRepository.update(term);
      order += 1;
    }
    version.setTermIds(orderedTermIds, now);
    await this.deps.contractVersionRepository.update(version);
    return this.deps.contractTermRepository.findByVersion(versionId);
  }

  async listByVersion(versionId: ContractVersionId): Promise<ContractTerm[]> {
    const terms = await this.deps.contractTermRepository.findByVersion(
      versionId,
    );
    return terms.sort((a, b) => a.order - b.order);
  }
}
