import { Organization } from "../aggregates/Organization/Organization.js";
import type { CreateOrganizationProps } from "../aggregates/Organization/Organization.js";
import { OrganizationSettings } from "../aggregates/OrganizationSettings/OrganizationSettings.js";
import { OrganizationStatus } from "../enums/OrganizationStatus.js";
import {
  DuplicateOrganizationSlugError,
  OrganizationNotFoundError,
} from "../errors/OrganizationErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { OrganizationActivationPolicy } from "../policies/OrganizationActivationPolicy.js";
import type { OrganizationRepository } from "../repositories/OrganizationRepository.js";
import type { OrganizationSettingsRepository } from "../repositories/OrganizationSettingsRepository.js";
import type { OrganizationId } from "../types/ids.js";
import { OrganizationSlug } from "../value-objects/OrganizationSlug.js";

export type OrganizationServiceDeps = {
  organizationRepository: OrganizationRepository;
  settingsRepository: OrganizationSettingsRepository;
  eventPublisher: DomainEventPublisher;
};

/**
 * Domain service for Organization lifecycle and status transitions.
 */
export class OrganizationService {
  constructor(private readonly deps: OrganizationServiceDeps) {}

  async create(
    props: CreateOrganizationProps,
  ): Promise<{ organization: Organization; settings: OrganizationSettings }> {
    const slug = props.slug
      ? OrganizationSlug.create(props.slug)
      : OrganizationSlug.fromName(props.name);

    if (await this.deps.organizationRepository.existsBySlug(slug)) {
      throw new DuplicateOrganizationSlugError(slug.value);
    }

    const organization = Organization.create({ ...props, slug: slug.value });
    const settings = OrganizationSettings.defaultsFor(organization.id, {
      timezone: organization.timezone.value,
      locale: organization.locale.value,
      currency: organization.currency.value,
      branding: organization.branding,
      now: props.now,
    });

    await this.deps.organizationRepository.save(organization);
    await this.deps.settingsRepository.save(settings);

    const events = [
      ...organization.pullDomainEvents(),
      ...settings.pullDomainEvents(),
    ];
    await this.deps.eventPublisher.publish(events);

    return { organization, settings };
  }

  async getById(id: OrganizationId): Promise<Organization> {
    const organization = await this.deps.organizationRepository.findById(id);
    if (!organization) {
      throw new OrganizationNotFoundError(id);
    }
    return organization;
  }

  async getBySlug(slug: string): Promise<Organization> {
    const organization =
      await this.deps.organizationRepository.findBySlug(slug);
    if (!organization) {
      throw new OrganizationNotFoundError(slug);
    }
    return organization;
  }

  async update(
    id: OrganizationId,
    props: {
      name?: string;
      displayName?: string;
      legalName?: string;
      description?: string | null;
      timezone?: string;
      locale?: string;
      currency?: string;
      branding?: CreateOrganizationProps["branding"];
      now?: Date;
    },
  ): Promise<Organization> {
    const organization = await this.getById(id);
    organization.update(props);
    await this.deps.organizationRepository.update(organization);
    await this.deps.eventPublisher.publish(organization.pullDomainEvents());
    return organization;
  }

  async changeStatus(
    id: OrganizationId,
    status: OrganizationStatus,
    now?: Date,
  ): Promise<Organization> {
    const organization = await this.getById(id);
    if (status === OrganizationStatus.ACTIVE) {
      OrganizationActivationPolicy.assertCanActivate(organization);
    } else if (status === OrganizationStatus.SUSPENDED) {
      OrganizationActivationPolicy.assertCanSuspend(organization);
    } else if (status === OrganizationStatus.INACTIVE) {
      OrganizationActivationPolicy.assertCanDeactivate(organization);
    }
    organization.changeStatus(status, now);
    if (organization.isArchived) {
      await this.deps.organizationRepository.archive(organization.id);
    } else {
      await this.deps.organizationRepository.update(organization);
    }
    await this.deps.eventPublisher.publish(organization.pullDomainEvents());
    return organization;
  }

  async archive(id: OrganizationId, now?: Date): Promise<Organization> {
    return this.changeStatus(id, OrganizationStatus.ARCHIVED, now);
  }

  async list(): Promise<Organization[]> {
    return this.deps.organizationRepository.findAll();
  }
}
