import type { OrganizationId, OrganizationRepository } from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import { CapacityProfile } from "../aggregates/CapacityProfile/CapacityProfile.js";
import type { CreateCapacityProfileProps } from "../aggregates/CapacityProfile/CapacityProfile.js";
import type { CapacityStatus } from "../enums/CapacityStatus.js";
import { CapacityProfileNotFoundError } from "../errors/CapacityErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import {
  AvailabilityPolicy,
  CapacityLifecyclePolicy,
  WorkingPatternPolicy,
} from "../policies/index.js";
import type { AvailabilityProfileRepository } from "../repositories/AvailabilityProfileRepository.js";
import type { CapacityProfileRepository } from "../repositories/CapacityProfileRepository.js";
import type { WorkingPatternRepository } from "../repositories/WorkingPatternRepository.js";
import type {
  AvailabilityProfileId,
  CapacityProfileId,
  ResourceId,
  WorkingPatternId,
} from "../types/ids.js";

export type CapacityProfileServiceDeps = {
  capacityProfileRepository: CapacityProfileRepository;
  organizationRepository: OrganizationRepository;
  availabilityProfileRepository: AvailabilityProfileRepository;
  workingPatternRepository: WorkingPatternRepository;
  eventPublisher: DomainEventPublisher;
};

export class CapacityProfileService {
  constructor(private readonly deps: CapacityProfileServiceDeps) {}

  async create(props: CreateCapacityProfileProps): Promise<CapacityProfile> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    if (organization.isArchived) {
      throw new CapacityProfileNotFoundError(
        "Cannot create capacity for archived organization.",
      );
    }

    if (props.availabilityProfileId) {
      const availability =
        await this.deps.availabilityProfileRepository.findById(
          props.availabilityProfileId,
        );
      if (!availability) {
        throw new CapacityProfileNotFoundError(
          `availability ${props.availabilityProfileId}`,
        );
      }
      if (availability.organizationId !== props.organizationId) {
        throw new CapacityProfileNotFoundError(
          "Availability profile organization mismatch.",
        );
      }
    }

    if (props.workingPatternId) {
      const pattern = await this.deps.workingPatternRepository.findById(
        props.workingPatternId,
      );
      if (!pattern) {
        throw new CapacityProfileNotFoundError(
          `working pattern ${props.workingPatternId}`,
        );
      }
      if (pattern.organizationId !== props.organizationId) {
        throw new CapacityProfileNotFoundError(
          "Working pattern organization mismatch.",
        );
      }
    }

    const existing = await this.deps.capacityProfileRepository.findByResource(
      props.resourceId,
    );
    const effectiveFrom = props.effectiveFrom ?? props.now ?? new Date();
    CapacityLifecyclePolicy.assertCanCreateActive(existing, {
      resourceId: props.resourceId,
      effectiveFrom,
      effectiveTo: props.effectiveTo ?? null,
    });

    const profile = CapacityProfile.create(props);
    await this.deps.capacityProfileRepository.save(profile);
    await this.deps.eventPublisher.publish(profile.pullDomainEvents());
    return profile;
  }

  async getById(id: CapacityProfileId): Promise<CapacityProfile> {
    const profile = await this.deps.capacityProfileRepository.findById(id);
    if (!profile) throw new CapacityProfileNotFoundError(id);
    return profile;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<CapacityProfile[]> {
    return this.deps.capacityProfileRepository.findByOrganization(
      organizationId,
    );
  }

  async listByResource(resourceId: ResourceId): Promise<CapacityProfile[]> {
    return this.deps.capacityProfileRepository.findByResource(resourceId);
  }

  async update(
    id: CapacityProfileId,
    props: {
      availabilityProfileId?: AvailabilityProfileId | null;
      workingPatternId?: WorkingPatternId | null;
      status?: CapacityStatus;
      effectiveFrom?: Date;
      effectiveTo?: Date | null;
      now?: Date;
    },
  ): Promise<CapacityProfile> {
    const profile = await this.getById(id);
    CapacityLifecyclePolicy.assertNotArchived(profile);

    if (props.availabilityProfileId) {
      const availability =
        await this.deps.availabilityProfileRepository.findById(
          props.availabilityProfileId,
        );
      AvailabilityPolicy.assertAssignable(profile, availability);
    }
    if (props.workingPatternId) {
      const pattern = await this.deps.workingPatternRepository.findById(
        props.workingPatternId,
      );
      WorkingPatternPolicy.assertAssignable(profile, pattern);
    }

    if (
      props.effectiveFrom !== undefined ||
      props.effectiveTo !== undefined
    ) {
      const existing = await this.deps.capacityProfileRepository.findByResource(
        profile.resourceId,
      );
      const others = existing.filter((p) => p.id !== profile.id);
      CapacityLifecyclePolicy.assertCanCreateActive(others, {
        resourceId: profile.resourceId,
        effectiveFrom: props.effectiveFrom ?? profile.effectiveFrom,
        effectiveTo:
          props.effectiveTo !== undefined
            ? props.effectiveTo
            : profile.effectiveTo,
      });
    }

    profile.update(props);
    if (profile.isArchived) {
      await this.deps.capacityProfileRepository.archive(id);
    } else {
      await this.deps.capacityProfileRepository.update(profile);
    }
    await this.deps.eventPublisher.publish(profile.pullDomainEvents());
    return profile;
  }

  async archive(id: CapacityProfileId, now?: Date): Promise<CapacityProfile> {
    const profile = await this.getById(id);
    profile.archive(now);
    await this.deps.capacityProfileRepository.archive(id);
    await this.deps.eventPublisher.publish(profile.pullDomainEvents());
    return profile;
  }
}
