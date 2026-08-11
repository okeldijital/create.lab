import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  AssetCollection,
  type CreateAssetCollectionProps,
} from "../aggregates/AssetCollection/AssetCollection.js";
import { CollectionNotFoundError } from "../errors/AssetErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { CollectionPolicy } from "../policies/CollectionPolicy.js";
import type { AssetCollectionRepository } from "../repositories/AssetCollectionRepository.js";
import type { AssetCollectionId, AssetId } from "../types/ids.js";

export type CollectionServiceDeps = {
  assetCollectionRepository: AssetCollectionRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class CollectionService {
  constructor(private readonly deps: CollectionServiceDeps) {}

  async create(
    props: CreateAssetCollectionProps,
  ): Promise<AssetCollection> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const existing =
      await this.deps.assetCollectionRepository.findByOrganization(
        props.organizationId,
      );
    CollectionPolicy.assertUniqueName(
      existing,
      props.name,
      props.organizationId,
    );

    const collection = AssetCollection.create(props);
    await this.deps.assetCollectionRepository.save(collection);
    await this.deps.eventPublisher.publish(collection.pullDomainEvents());
    return collection;
  }

  async rename(
    id: AssetCollectionId,
    name: string,
    now?: Date,
  ): Promise<AssetCollection> {
    const collection = await this.getById(id);
    CollectionPolicy.assertMutable(collection);
    const existing =
      await this.deps.assetCollectionRepository.findByOrganization(
        collection.organizationId,
      );
    CollectionPolicy.assertUniqueName(
      existing,
      name,
      collection.organizationId,
      collection.id,
    );
    collection.rename(name, now);
    await this.deps.assetCollectionRepository.update(collection);
    await this.deps.eventPublisher.publish(collection.pullDomainEvents());
    return collection;
  }

  async archive(
    id: AssetCollectionId,
    now?: Date,
  ): Promise<AssetCollection> {
    const collection = await this.getById(id);
    collection.archive(now);
    await this.deps.assetCollectionRepository.archive(id);
    await this.deps.assetCollectionRepository.update(collection);
    await this.deps.eventPublisher.publish(collection.pullDomainEvents());
    return collection;
  }

  async addAsset(
    id: AssetCollectionId,
    assetId: AssetId,
    now?: Date,
  ): Promise<AssetCollection> {
    const collection = await this.getById(id);
    collection.addAsset(assetId, now);
    await this.deps.assetCollectionRepository.update(collection);
    await this.deps.eventPublisher.publish(collection.pullDomainEvents());
    return collection;
  }

  async removeAsset(
    id: AssetCollectionId,
    assetId: AssetId,
    now?: Date,
  ): Promise<AssetCollection> {
    const collection = await this.getById(id);
    collection.removeAsset(assetId, now);
    await this.deps.assetCollectionRepository.update(collection);
    await this.deps.eventPublisher.publish(collection.pullDomainEvents());
    return collection;
  }

  async getById(id: AssetCollectionId): Promise<AssetCollection> {
    const collection =
      await this.deps.assetCollectionRepository.findById(id);
    if (!collection) throw new CollectionNotFoundError(id);
    return collection;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<AssetCollection[]> {
    return this.deps.assetCollectionRepository.findByOrganization(
      organizationId,
    );
  }
}
