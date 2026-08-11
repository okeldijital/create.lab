import { Capability } from "../aggregates/Capability/Capability.js";
import type { CreateCapabilityProps } from "../aggregates/Capability/Capability.js";
import {
  CapabilityNotFoundError,
  CapacityProfileNotFoundError,
} from "../errors/CapacityErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { CapabilityAssignmentPolicy } from "../policies/CapabilityAssignmentPolicy.js";
import type { CapabilityRepository } from "../repositories/CapabilityRepository.js";
import type { CapacityProfileRepository } from "../repositories/CapacityProfileRepository.js";
import type { CapabilityId, CapacityProfileId } from "../types/ids.js";

export type CapabilityServiceDeps = {
  capabilityRepository: CapabilityRepository;
  capacityProfileRepository: CapacityProfileRepository;
  eventPublisher: DomainEventPublisher;
};

export class CapabilityService {
  constructor(private readonly deps: CapabilityServiceDeps) {}

  async add(props: CreateCapabilityProps): Promise<Capability> {
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

    const existing =
      await this.deps.capabilityRepository.findByCapacityProfile(
        props.capacityProfileId,
      );
    CapabilityAssignmentPolicy.assertCanAdd(profile, existing, props.name);

    const capability = Capability.create(props);
    await this.deps.capabilityRepository.save(capability);
    await this.deps.eventPublisher.publish(capability.pullDomainEvents());
    return capability;
  }

  async getById(id: CapabilityId): Promise<Capability> {
    const capability = await this.deps.capabilityRepository.findById(id);
    if (!capability) throw new CapabilityNotFoundError(id);
    return capability;
  }

  async listByProfile(
    capacityProfileId: CapacityProfileId,
  ): Promise<Capability[]> {
    return this.deps.capabilityRepository.findByCapacityProfile(
      capacityProfileId,
    );
  }

  async remove(id: CapabilityId, now?: Date): Promise<Capability> {
    const capability = await this.getById(id);
    capability.remove(now);
    await this.deps.capabilityRepository.update(capability);
    await this.deps.eventPublisher.publish(capability.pullDomainEvents());
    return capability;
  }
}
