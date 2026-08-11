import { ResourceCapacity } from "../aggregates/ResourceCapacity/ResourceCapacity.js";
import type { CreateResourceCapacityProps } from "../aggregates/ResourceCapacity/ResourceCapacity.js";
import type { CapacityUnit } from "../enums/CapacityUnit.js";
import {
  CapacityProfileNotFoundError,
  ResourceCapacityNotFoundError,
} from "../errors/CapacityErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { CapacityLifecyclePolicy } from "../policies/CapacityLifecyclePolicy.js";
import type { CapacityProfileRepository } from "../repositories/CapacityProfileRepository.js";
import type { ResourceCapacityRepository } from "../repositories/ResourceCapacityRepository.js";
import type {
  CapacityProfileId,
  ResourceCapacityId,
} from "../types/ids.js";

export type ResourceCapacityServiceDeps = {
  resourceCapacityRepository: ResourceCapacityRepository;
  capacityProfileRepository: CapacityProfileRepository;
  eventPublisher: DomainEventPublisher;
};

export class ResourceCapacityService {
  constructor(private readonly deps: ResourceCapacityServiceDeps) {}

  async define(props: CreateResourceCapacityProps): Promise<ResourceCapacity> {
    const profile = await this.deps.capacityProfileRepository.findById(
      props.capacityProfileId,
    );
    if (!profile) {
      throw new CapacityProfileNotFoundError(props.capacityProfileId);
    }
    if (profile.organizationId !== props.organizationId) {
      throw new CapacityProfileNotFoundError(
        "Capacity profile organization mismatch.",
      );
    }
    CapacityLifecyclePolicy.assertActive(profile);

    const capacity = ResourceCapacity.create(props);
    await this.deps.resourceCapacityRepository.save(capacity);
    await this.deps.eventPublisher.publish(capacity.pullDomainEvents());
    return capacity;
  }

  async getById(id: ResourceCapacityId): Promise<ResourceCapacity> {
    const capacity = await this.deps.resourceCapacityRepository.findById(id);
    if (!capacity) throw new ResourceCapacityNotFoundError(id);
    return capacity;
  }

  async listByProfile(
    capacityProfileId: CapacityProfileId,
  ): Promise<ResourceCapacity[]> {
    return this.deps.resourceCapacityRepository.findByCapacityProfile(
      capacityProfileId,
    );
  }

  async update(
    id: ResourceCapacityId,
    props: {
      quantity?: number;
      unit?: CapacityUnit;
      capacityType?: string;
      effectiveFrom?: Date;
      effectiveTo?: Date | null;
      now?: Date;
    },
  ): Promise<ResourceCapacity> {
    const capacity = await this.getById(id);
    capacity.update(props);
    await this.deps.resourceCapacityRepository.update(capacity);
    await this.deps.eventPublisher.publish(capacity.pullDomainEvents());
    return capacity;
  }
}
