import type { AnyDomainEvent } from "@creative-lab/core";
import {
  Organization,
  type OrganizationId,
  type OrganizationRepository,
  type OrganizationSlug,
} from "@creative-lab/organization";
import type { AvailabilityProfile } from "../../aggregates/AvailabilityProfile/AvailabilityProfile.js";
import type { Capability } from "../../aggregates/Capability/Capability.js";
import type { CapacityProfile } from "../../aggregates/CapacityProfile/CapacityProfile.js";
import type { ResourceCapacity } from "../../aggregates/ResourceCapacity/ResourceCapacity.js";
import type { WorkingPattern } from "../../aggregates/WorkingPattern/WorkingPattern.js";
import { CapacityStatus } from "../../enums/CapacityStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { AvailabilityProfileRepository } from "../../repositories/AvailabilityProfileRepository.js";
import type { CapabilityRepository } from "../../repositories/CapabilityRepository.js";
import type { CapacityProfileRepository } from "../../repositories/CapacityProfileRepository.js";
import type { ResourceCapacityRepository } from "../../repositories/ResourceCapacityRepository.js";
import type { WorkingPatternRepository } from "../../repositories/WorkingPatternRepository.js";
import type {
  AvailabilityProfileId,
  CapabilityId,
  CapacityProfileId,
  ResourceCapacityId,
  ResourceId,
  WorkingPatternId,
} from "../../types/ids.js";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: AnyDomainEvent[] = [];
  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.events.push(...events);
  }
  clear(): void {
    this.events.length = 0;
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly byId = new Map<string, Organization>();
  async findById(id: OrganizationId): Promise<Organization | null> {
    return this.byId.get(id) ?? null;
  }
  async findBySlug(
    slug: OrganizationSlug | string,
  ): Promise<Organization | null> {
    const v = typeof slug === "string" ? slug : slug.value;
    for (const o of this.byId.values()) {
      if (o.slug.value === v) return o;
    }
    return null;
  }
  async findAll(): Promise<Organization[]> {
    return [...this.byId.values()];
  }
  async save(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: OrganizationId): Promise<void> {
    void id;
  }
  async exists(id: OrganizationId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsBySlug(slug: OrganizationSlug | string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }
  async delete(id: OrganizationId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryCapacityProfileRepository
  implements CapacityProfileRepository
{
  private readonly byId = new Map<string, CapacityProfile>();
  async findById(id: CapacityProfileId): Promise<CapacityProfile | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<CapacityProfile[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId,
    );
  }
  async findByResource(resourceId: ResourceId): Promise<CapacityProfile[]> {
    return [...this.byId.values()].filter((p) => p.resourceId === resourceId);
  }
  async findActiveByResource(
    resourceId: ResourceId,
  ): Promise<CapacityProfile | null> {
    return (
      [...this.byId.values()].find(
        (p) =>
          p.resourceId === resourceId && p.status === CapacityStatus.ACTIVE,
      ) ?? null
    );
  }
  async findAll(): Promise<CapacityProfile[]> {
    return [...this.byId.values()];
  }
  async save(profile: CapacityProfile): Promise<void> {
    this.byId.set(profile.id, profile);
  }
  async update(profile: CapacityProfile): Promise<void> {
    this.byId.set(profile.id, profile);
  }
  async archive(id: CapacityProfileId): Promise<void> {
    void id;
  }
  async exists(id: CapacityProfileId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryCapabilityRepository implements CapabilityRepository {
  private readonly byId = new Map<string, Capability>();
  async findById(id: CapabilityId): Promise<Capability | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Capability[]> {
    return [...this.byId.values()].filter(
      (c) => c.organizationId === organizationId,
    );
  }
  async findByCapacityProfile(
    capacityProfileId: CapacityProfileId,
  ): Promise<Capability[]> {
    return [...this.byId.values()].filter(
      (c) => c.capacityProfileId === capacityProfileId,
    );
  }
  async findActiveByProfileAndName(
    capacityProfileId: CapacityProfileId,
    name: string,
  ): Promise<Capability | null> {
    const t = name.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (c) =>
          c.capacityProfileId === capacityProfileId &&
          c.active &&
          c.name.value.toLowerCase() === t,
      ) ?? null
    );
  }
  async findAll(): Promise<Capability[]> {
    return [...this.byId.values()];
  }
  async save(capability: Capability): Promise<void> {
    this.byId.set(capability.id, capability);
  }
  async update(capability: Capability): Promise<void> {
    this.byId.set(capability.id, capability);
  }
  async archive(id: CapabilityId): Promise<void> {
    void id;
  }
  async exists(id: CapabilityId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryAvailabilityProfileRepository
  implements AvailabilityProfileRepository
{
  private readonly byId = new Map<string, AvailabilityProfile>();
  async findById(
    id: AvailabilityProfileId,
  ): Promise<AvailabilityProfile | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<AvailabilityProfile[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId,
    );
  }
  async findAll(): Promise<AvailabilityProfile[]> {
    return [...this.byId.values()];
  }
  async save(profile: AvailabilityProfile): Promise<void> {
    this.byId.set(profile.id, profile);
  }
  async update(profile: AvailabilityProfile): Promise<void> {
    this.byId.set(profile.id, profile);
  }
  async archive(id: AvailabilityProfileId): Promise<void> {
    void id;
  }
  async exists(id: AvailabilityProfileId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryWorkingPatternRepository
  implements WorkingPatternRepository
{
  private readonly byId = new Map<string, WorkingPattern>();
  async findById(id: WorkingPatternId): Promise<WorkingPattern | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkingPattern[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId,
    );
  }
  async findAll(): Promise<WorkingPattern[]> {
    return [...this.byId.values()];
  }
  async save(pattern: WorkingPattern): Promise<void> {
    this.byId.set(pattern.id, pattern);
  }
  async update(pattern: WorkingPattern): Promise<void> {
    this.byId.set(pattern.id, pattern);
  }
  async archive(id: WorkingPatternId): Promise<void> {
    void id;
  }
  async exists(id: WorkingPatternId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryResourceCapacityRepository
  implements ResourceCapacityRepository
{
  private readonly byId = new Map<string, ResourceCapacity>();
  async findById(id: ResourceCapacityId): Promise<ResourceCapacity | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ResourceCapacity[]> {
    return [...this.byId.values()].filter(
      (c) => c.organizationId === organizationId,
    );
  }
  async findByCapacityProfile(
    capacityProfileId: CapacityProfileId,
  ): Promise<ResourceCapacity[]> {
    return [...this.byId.values()].filter(
      (c) => c.capacityProfileId === capacityProfileId,
    );
  }
  async findAll(): Promise<ResourceCapacity[]> {
    return [...this.byId.values()];
  }
  async save(capacity: ResourceCapacity): Promise<void> {
    this.byId.set(capacity.id, capacity);
  }
  async update(capacity: ResourceCapacity): Promise<void> {
    this.byId.set(capacity.id, capacity);
  }
  async archive(id: ResourceCapacityId): Promise<void> {
    void id;
  }
  async exists(id: ResourceCapacityId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export async function seedOrganization(
  orgs: InMemoryOrganizationRepository,
): Promise<Organization> {
  const organization = Organization.create({
    name: "Acme Creative",
    slug: "acme-capacity",
  });
  organization.pullDomainEvents();
  await orgs.save(organization);
  return organization;
}
