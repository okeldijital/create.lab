import {
  AssetRelationship,
  type CreateAssetRelationshipProps,
} from "../aggregates/AssetRelationship/AssetRelationship.js";
import { RelationshipError } from "../errors/AssetErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { RelationshipPolicy } from "../policies/RelationshipPolicy.js";
import type { AssetRelationshipRepository } from "../repositories/AssetRelationshipRepository.js";
import type { AssetId, AssetRelationshipId } from "../types/ids.js";

export type RelationshipServiceDeps = {
  assetRelationshipRepository: AssetRelationshipRepository;
  eventPublisher: DomainEventPublisher;
};

export class RelationshipService {
  constructor(private readonly deps: RelationshipServiceDeps) {}

  async create(
    props: CreateAssetRelationshipProps,
  ): Promise<AssetRelationship> {
    const fromSource =
      await this.deps.assetRelationshipRepository.findBySource(
        props.sourceAssetId,
      );
    RelationshipPolicy.assertNoDuplicate(
      fromSource,
      props.sourceAssetId,
      props.targetAssetId,
      props.relationshipType,
    );

    const relationship = AssetRelationship.create(props);
    await this.deps.assetRelationshipRepository.save(relationship);
    await this.deps.eventPublisher.publish(relationship.pullDomainEvents());
    return relationship;
  }

  async remove(
    id: AssetRelationshipId,
    now?: Date,
  ): Promise<AssetRelationship> {
    const relationship =
      await this.deps.assetRelationshipRepository.findById(id);
    if (!relationship) {
      throw new RelationshipError(`Relationship not found: ${id}`);
    }
    relationship.remove(now);
    await this.deps.assetRelationshipRepository.remove(id);
    await this.deps.eventPublisher.publish(relationship.pullDomainEvents());
    return relationship;
  }

  async listBySource(sourceAssetId: AssetId): Promise<AssetRelationship[]> {
    return this.deps.assetRelationshipRepository.findBySource(sourceAssetId);
  }

  async listByTarget(targetAssetId: AssetId): Promise<AssetRelationship[]> {
    return this.deps.assetRelationshipRepository.findByTarget(targetAssetId);
  }
}
