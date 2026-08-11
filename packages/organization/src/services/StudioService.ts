import { Studio } from "../aggregates/Studio/Studio.js";
import type { CreateStudioProps } from "../aggregates/Studio/Studio.js";
import type { StudioStatus } from "../enums/StudioStatus.js";
import type { StudioType } from "../enums/StudioType.js";
import { OrganizationNotFoundError } from "../errors/OrganizationErrors.js";
import {
  DuplicateStudioError,
  StudioNotFoundError,
} from "../errors/StudioErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { OrganizationActivationPolicy } from "../policies/OrganizationActivationPolicy.js";
import type { OrganizationRepository } from "../repositories/OrganizationRepository.js";
import type { StudioRepository } from "../repositories/StudioRepository.js";
import type { OrganizationId, StudioId } from "../types/ids.js";

export type StudioServiceDeps = {
  studioRepository: StudioRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class StudioService {
  constructor(private readonly deps: StudioServiceDeps) {}

  async create(props: CreateStudioProps): Promise<Studio> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    OrganizationActivationPolicy.assertOperational(organization);

    if (
      await this.deps.studioRepository.existsByNameInOrganization(
        props.organizationId,
        props.name.trim(),
      )
    ) {
      throw new DuplicateStudioError(props.name.trim(), props.organizationId);
    }

    const studio = Studio.create(props);
    await this.deps.studioRepository.save(studio);
    await this.deps.eventPublisher.publish(studio.pullDomainEvents());
    return studio;
  }

  async getById(id: StudioId): Promise<Studio> {
    const studio = await this.deps.studioRepository.findById(id);
    if (!studio) {
      throw new StudioNotFoundError(id);
    }
    return studio;
  }

  async listByOrganization(organizationId: OrganizationId): Promise<Studio[]> {
    return this.deps.studioRepository.findByOrganizationId(organizationId);
  }

  async update(
    id: StudioId,
    props: {
      name?: string;
      description?: string | null;
      type?: StudioType;
      capacity?: number;
      location?: string | null;
      status?: StudioStatus;
      now?: Date;
    },
  ): Promise<Studio> {
    const studio = await this.getById(id);
    const organization = await this.deps.organizationRepository.findById(
      studio.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(studio.organizationId);
    }
    OrganizationActivationPolicy.assertOperational(organization);

    if (props.name !== undefined) {
      const existing =
        await this.deps.studioRepository.findByNameInOrganization(
          studio.organizationId,
          props.name.trim(),
        );
      if (existing && existing.id !== studio.id) {
        throw new DuplicateStudioError(
          props.name.trim(),
          studio.organizationId,
        );
      }
    }

    studio.update(props);
    if (studio.isArchived) {
      await this.deps.studioRepository.archive(studio.id);
    } else {
      await this.deps.studioRepository.update(studio);
    }
    await this.deps.eventPublisher.publish(studio.pullDomainEvents());
    return studio;
  }

  async archive(id: StudioId, now?: Date): Promise<Studio> {
    const studio = await this.getById(id);
    studio.archive(now);
    await this.deps.studioRepository.archive(id);
    await this.deps.eventPublisher.publish(studio.pullDomainEvents());
    return studio;
  }
}
