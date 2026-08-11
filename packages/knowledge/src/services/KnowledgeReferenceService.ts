import {
  KnowledgeReference,
  type CreateKnowledgeReferenceProps,
} from "../aggregates/KnowledgeReference/KnowledgeReference.js";
import {
  KnowledgeArticleNotFoundError,
  KnowledgeReferenceNotFoundError,
} from "../errors/KnowledgeErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { KnowledgeLifecyclePolicy } from "../policies/KnowledgeLifecyclePolicy.js";
import { ReferencePolicy } from "../policies/ReferencePolicy.js";
import type { KnowledgeArticleRepository } from "../repositories/KnowledgeArticleRepository.js";
import type { KnowledgeReferenceRepository } from "../repositories/KnowledgeReferenceRepository.js";
import type { KnowledgeReferenceId } from "../types/ids.js";

export type KnowledgeReferenceServiceDeps = {
  referenceRepository: KnowledgeReferenceRepository;
  articleRepository: KnowledgeArticleRepository;
  eventPublisher: DomainEventPublisher;
};

export class KnowledgeReferenceService {
  constructor(private readonly deps: KnowledgeReferenceServiceDeps) {}

  async create(
    props: CreateKnowledgeReferenceProps,
  ): Promise<KnowledgeReference> {
    ReferencePolicy.assertNoSelfReference(
      props.sourceArticleId,
      props.targetArticleId,
    );

    const source = await this.deps.articleRepository.findById(
      props.sourceArticleId,
    );
    if (!source) {
      throw new KnowledgeArticleNotFoundError(props.sourceArticleId);
    }
    KnowledgeLifecyclePolicy.assertStructurallyEditable(source);

    const target = await this.deps.articleRepository.findById(
      props.targetArticleId,
    );
    if (!target) {
      throw new KnowledgeArticleNotFoundError(props.targetArticleId);
    }

    const existing = await this.deps.referenceRepository.findByRelationship(
      props.sourceArticleId,
      props.targetArticleId,
      props.relationshipType,
    );
    ReferencePolicy.assertUniqueRelationship(
      props.sourceArticleId,
      props.targetArticleId,
      props.relationshipType,
      existing,
    );

    const reference = KnowledgeReference.create({
      ...props,
      organizationId: props.organizationId ?? source.organizationId,
    });
    await this.deps.referenceRepository.save(reference);
    source.addReferenceId(reference.id);
    await this.deps.articleRepository.update(source);
    await this.deps.eventPublisher.publish(reference.pullDomainEvents());
    await this.deps.eventPublisher.publish(source.pullDomainEvents());
    return reference;
  }

  async remove(
    id: KnowledgeReferenceId,
    now?: Date,
  ): Promise<KnowledgeReference> {
    const reference = await this.getById(id);
    ReferencePolicy.assertActive(reference);
    reference.remove(now);
    await this.deps.referenceRepository.update(reference);
    await this.deps.referenceRepository.archive(id);

    const source = await this.deps.articleRepository.findById(
      reference.sourceArticleId,
    );
    if (source) {
      KnowledgeLifecyclePolicy.assertStructurallyEditable(source);
      source.removeReferenceId(id, now);
      await this.deps.articleRepository.update(source);
      await this.deps.eventPublisher.publish(source.pullDomainEvents());
    }

    await this.deps.eventPublisher.publish(reference.pullDomainEvents());
    return reference;
  }

  async getById(id: KnowledgeReferenceId): Promise<KnowledgeReference> {
    const reference = await this.deps.referenceRepository.findById(id);
    if (!reference) throw new KnowledgeReferenceNotFoundError(id);
    return reference;
  }
}
