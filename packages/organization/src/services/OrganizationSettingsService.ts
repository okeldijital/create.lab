import type { OrganizationSettings } from "../aggregates/OrganizationSettings/OrganizationSettings.js";
import { OrganizationNotFoundError } from "../errors/OrganizationErrors.js";
import { OrganizationSettingsNotFoundError } from "../errors/SettingsErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { OrganizationActivationPolicy } from "../policies/OrganizationActivationPolicy.js";
import type { OrganizationRepository } from "../repositories/OrganizationRepository.js";
import type { OrganizationSettingsRepository } from "../repositories/OrganizationSettingsRepository.js";
import type { BrandingMetadata, PoliciesMetadata } from "../types/index.js";
import type { OrganizationId } from "../types/ids.js";
import type { WorkingHours } from "../value-objects/WorkingHours.js";
import type { WorkingWeek } from "../value-objects/WorkingWeek.js";

export type OrganizationSettingsServiceDeps = {
  settingsRepository: OrganizationSettingsRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class OrganizationSettingsService {
  constructor(private readonly deps: OrganizationSettingsServiceDeps) {}

  async getByOrganizationId(
    organizationId: OrganizationId,
  ): Promise<OrganizationSettings> {
    const settings =
      await this.deps.settingsRepository.findByOrganizationId(organizationId);
    if (!settings) {
      throw new OrganizationSettingsNotFoundError(organizationId);
    }
    return settings;
  }

  async update(
    organizationId: OrganizationId,
    props: {
      timezone?: string;
      locale?: string;
      currency?: string;
      workingWeek?: WorkingWeek;
      workingHours?: WorkingHours;
      branding?: BrandingMetadata;
      policies?: PoliciesMetadata;
      now?: Date;
    },
  ): Promise<OrganizationSettings> {
    const organization =
      await this.deps.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new OrganizationNotFoundError(organizationId);
    }
    OrganizationActivationPolicy.assertOperational(organization);

    const settings = await this.getByOrganizationId(organizationId);
    settings.update(props);
    await this.deps.settingsRepository.update(settings);
    await this.deps.eventPublisher.publish(settings.pullDomainEvents());
    return settings;
  }
}
