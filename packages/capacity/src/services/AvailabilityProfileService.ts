import type { OrganizationId, OrganizationRepository } from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import { AvailabilityProfile } from "../aggregates/AvailabilityProfile/AvailabilityProfile.js";
import type {
  AvailabilityException,
  CreateAvailabilityProfileProps,
} from "../aggregates/AvailabilityProfile/AvailabilityProfile.js";
import { AvailabilityProfileNotFoundError } from "../errors/CapacityErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import type { AvailabilityProfileRepository } from "../repositories/AvailabilityProfileRepository.js";
import type { AvailabilityProfileId } from "../types/ids.js";
import type { Weekday } from "../value-objects/WorkingDaySet.js";

export type AvailabilityProfileServiceDeps = {
  availabilityProfileRepository: AvailabilityProfileRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class AvailabilityProfileService {
  constructor(private readonly deps: AvailabilityProfileServiceDeps) {}

  async create(
    props: CreateAvailabilityProfileProps,
  ): Promise<AvailabilityProfile> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const profile = AvailabilityProfile.create(props);
    await this.deps.availabilityProfileRepository.save(profile);
    await this.deps.eventPublisher.publish(profile.pullDomainEvents());
    return profile;
  }

  async getById(id: AvailabilityProfileId): Promise<AvailabilityProfile> {
    const profile =
      await this.deps.availabilityProfileRepository.findById(id);
    if (!profile) throw new AvailabilityProfileNotFoundError(id);
    return profile;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<AvailabilityProfile[]> {
    return this.deps.availabilityProfileRepository.findByOrganization(
      organizationId,
    );
  }

  async update(
    id: AvailabilityProfileId,
    props: {
      name?: string;
      timezone?: string;
      workingDays?: readonly Weekday[];
      workingHoursStart?: string;
      workingHoursEnd?: string;
      exceptions?: readonly AvailabilityException[];
      now?: Date;
    },
  ): Promise<AvailabilityProfile> {
    const profile = await this.getById(id);
    profile.update(props);
    await this.deps.availabilityProfileRepository.update(profile);
    await this.deps.eventPublisher.publish(profile.pullDomainEvents());
    return profile;
  }
}
