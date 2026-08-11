import type { Department } from "../../aggregates/Department/Department.js";
import type { Organization } from "../../aggregates/Organization/Organization.js";
import type { OrganizationSettings } from "../../aggregates/OrganizationSettings/OrganizationSettings.js";
import type { Studio } from "../../aggregates/Studio/Studio.js";
import type { Team } from "../../aggregates/Team/Team.js";
import type { AnyDomainEvent } from "@creative-lab/core";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { DepartmentRepository } from "../../repositories/DepartmentRepository.js";
import type { OrganizationRepository } from "../../repositories/OrganizationRepository.js";
import type { OrganizationSettingsRepository } from "../../repositories/OrganizationSettingsRepository.js";
import type { StudioRepository } from "../../repositories/StudioRepository.js";
import type { TeamRepository } from "../../repositories/TeamRepository.js";
import type {
  DepartmentId,
  OrganizationId,
  StudioId,
  TeamId,
} from "../../types/ids.js";
import type { OrganizationSlug } from "../../value-objects/OrganizationSlug.js";

function slugValue(slug: OrganizationSlug | string): string {
  return typeof slug === "string" ? slug : slug.value;
}

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
    const value = slugValue(slug);
    for (const org of this.byId.values()) {
      if (org.slug.value === value) return org;
    }
    return null;
  }

  async findAll(): Promise<Organization[]> {
    return [...this.byId.values()];
  }

  async save(organization: Organization): Promise<void> {
    this.byId.set(organization.id, organization);
  }

  async update(organization: Organization): Promise<void> {
    this.byId.set(organization.id, organization);
  }

  async archive(id: OrganizationId): Promise<void> {
    const org = this.byId.get(id);
    if (org) this.byId.set(id, org);
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

export class InMemoryDepartmentRepository implements DepartmentRepository {
  private readonly byId = new Map<string, Department>();

  async findById(id: DepartmentId): Promise<Department | null> {
    return this.byId.get(id) ?? null;
  }

  async findByOrganizationId(
    organizationId: OrganizationId,
  ): Promise<Department[]> {
    return [...this.byId.values()].filter(
      (d) => d.organizationId === organizationId,
    );
  }

  async findByNameInOrganization(
    organizationId: OrganizationId,
    name: string,
  ): Promise<Department | null> {
    const target = name.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (d) =>
          d.organizationId === organizationId &&
          d.name.value.toLowerCase() === target,
      ) ?? null
    );
  }

  async findAll(): Promise<Department[]> {
    return [...this.byId.values()];
  }

  async save(department: Department): Promise<void> {
    this.byId.set(department.id, department);
  }

  async update(department: Department): Promise<void> {
    this.byId.set(department.id, department);
  }

  async archive(id: DepartmentId): Promise<void> {
    const d = this.byId.get(id);
    if (d) this.byId.set(id, d);
  }

  async exists(id: DepartmentId): Promise<boolean> {
    return this.byId.has(id);
  }

  async existsByNameInOrganization(
    organizationId: OrganizationId,
    name: string,
  ): Promise<boolean> {
    return (await this.findByNameInOrganization(organizationId, name)) !== null;
  }

  async delete(id: DepartmentId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryTeamRepository implements TeamRepository {
  private readonly byId = new Map<string, Team>();

  async findById(id: TeamId): Promise<Team | null> {
    return this.byId.get(id) ?? null;
  }

  async findByOrganizationId(organizationId: OrganizationId): Promise<Team[]> {
    return [...this.byId.values()].filter(
      (t) => t.organizationId === organizationId,
    );
  }

  async findByDepartmentId(departmentId: DepartmentId): Promise<Team[]> {
    return [...this.byId.values()].filter(
      (t) => t.departmentId === departmentId,
    );
  }

  async findByNameInDepartment(
    departmentId: DepartmentId,
    name: string,
  ): Promise<Team | null> {
    const target = name.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (t) =>
          t.departmentId === departmentId &&
          t.name.value.toLowerCase() === target,
      ) ?? null
    );
  }

  async findAll(): Promise<Team[]> {
    return [...this.byId.values()];
  }

  async save(team: Team): Promise<void> {
    this.byId.set(team.id, team);
  }

  async update(team: Team): Promise<void> {
    this.byId.set(team.id, team);
  }

  async archive(id: TeamId): Promise<void> {
    const t = this.byId.get(id);
    if (t) this.byId.set(id, t);
  }

  async exists(id: TeamId): Promise<boolean> {
    return this.byId.has(id);
  }

  async existsByNameInDepartment(
    departmentId: DepartmentId,
    name: string,
  ): Promise<boolean> {
    return (await this.findByNameInDepartment(departmentId, name)) !== null;
  }

  async delete(id: TeamId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryStudioRepository implements StudioRepository {
  private readonly byId = new Map<string, Studio>();

  async findById(id: StudioId): Promise<Studio | null> {
    return this.byId.get(id) ?? null;
  }

  async findByOrganizationId(
    organizationId: OrganizationId,
  ): Promise<Studio[]> {
    return [...this.byId.values()].filter(
      (s) => s.organizationId === organizationId,
    );
  }

  async findByNameInOrganization(
    organizationId: OrganizationId,
    name: string,
  ): Promise<Studio | null> {
    const target = name.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (s) =>
          s.organizationId === organizationId &&
          s.name.value.toLowerCase() === target,
      ) ?? null
    );
  }

  async findAll(): Promise<Studio[]> {
    return [...this.byId.values()];
  }

  async save(studio: Studio): Promise<void> {
    this.byId.set(studio.id, studio);
  }

  async update(studio: Studio): Promise<void> {
    this.byId.set(studio.id, studio);
  }

  async archive(id: StudioId): Promise<void> {
    const s = this.byId.get(id);
    if (s) this.byId.set(id, s);
  }

  async exists(id: StudioId): Promise<boolean> {
    return this.byId.has(id);
  }

  async existsByNameInOrganization(
    organizationId: OrganizationId,
    name: string,
  ): Promise<boolean> {
    return (
      (await this.findByNameInOrganization(organizationId, name)) !== null
    );
  }

  async delete(id: StudioId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryOrganizationSettingsRepository
  implements OrganizationSettingsRepository
{
  private readonly byOrg = new Map<string, OrganizationSettings>();

  async findByOrganizationId(
    organizationId: OrganizationId,
  ): Promise<OrganizationSettings | null> {
    return this.byOrg.get(organizationId) ?? null;
  }

  async findById(
    organizationId: OrganizationId,
  ): Promise<OrganizationSettings | null> {
    return this.findByOrganizationId(organizationId);
  }

  async findAll(): Promise<OrganizationSettings[]> {
    return [...this.byOrg.values()];
  }

  async save(settings: OrganizationSettings): Promise<void> {
    this.byOrg.set(settings.organizationId, settings);
  }

  async update(settings: OrganizationSettings): Promise<void> {
    this.byOrg.set(settings.organizationId, settings);
  }

  async archive(organizationId: OrganizationId): Promise<void> {
    // Settings are not independently archived
    void organizationId;
  }

  async exists(organizationId: OrganizationId): Promise<boolean> {
    return this.byOrg.has(organizationId);
  }

  async delete(organizationId: OrganizationId): Promise<void> {
    this.byOrg.delete(organizationId);
  }
}
