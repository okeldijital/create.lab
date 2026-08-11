import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { Deliverable } from "../../aggregates/Deliverable/Deliverable.js";
import type { Project } from "../../aggregates/Project/Project.js";
import type { ProjectDependency } from "../../aggregates/ProjectDependency/ProjectDependency.js";
import type { ProjectObjective } from "../../aggregates/ProjectObjective/ProjectObjective.js";
import type { ProjectPhase } from "../../aggregates/ProjectPhase/ProjectPhase.js";
import { DeliverableStatus } from "../../enums/DeliverableStatus.js";
import { DependencyStatus } from "../../enums/DependencyStatus.js";
import { ObjectiveStatus } from "../../enums/ObjectiveStatus.js";
import { PhaseStatus } from "../../enums/PhaseStatus.js";
import { ProjectStatus } from "../../enums/ProjectStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { DeliverableRepository } from "../../repositories/DeliverableRepository.js";
import type { ProjectDependencyRepository } from "../../repositories/ProjectDependencyRepository.js";
import type { ProjectObjectiveRepository } from "../../repositories/ProjectObjectiveRepository.js";
import type { ProjectPhaseRepository } from "../../repositories/ProjectPhaseRepository.js";
import type { ProjectRepository } from "../../repositories/ProjectRepository.js";
import type {
  DeliverableId,
  ProjectDependencyId,
  ProjectId,
  ProjectObjectiveId,
  ProjectPhaseId,
} from "../../types/ids.js";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: AnyDomainEvent[] = [];
  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.events.push(...events);
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

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly byId = new Map<string, Project>();
  private readonly archived = new Set<string>();

  async findById(id: ProjectId): Promise<Project | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Project[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId && !this.archived.has(p.id),
    );
  }
  async findByOwner(ownerId: string): Promise<Project[]> {
    return [...this.byId.values()].filter(
      (p) => p.ownerId === ownerId && !this.archived.has(p.id),
    );
  }
  async findActive(): Promise<Project[]> {
    return [...this.byId.values()].filter(
      (p) =>
        !this.archived.has(p.id) &&
        p.status !== ProjectStatus.CLOSED &&
        p.status !== ProjectStatus.CANCELLED &&
        p.status !== ProjectStatus.COMPLETED,
    );
  }
  async save(project: Project): Promise<void> {
    this.byId.set(project.id, project);
  }
  async update(project: Project): Promise<void> {
    this.byId.set(project.id, project);
  }
  async archive(id: ProjectId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: ProjectId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemoryProjectPhaseRepository
  implements ProjectPhaseRepository
{
  private readonly byId = new Map<string, ProjectPhase>();
  private readonly archived = new Set<string>();

  async findById(id: ProjectPhaseId): Promise<ProjectPhase | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ProjectPhase[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId && !this.archived.has(p.id),
    );
  }
  async findByProject(projectId: ProjectId): Promise<ProjectPhase[]> {
    return [...this.byId.values()].filter(
      (p) => p.projectId === projectId && !this.archived.has(p.id),
    );
  }
  async findActive(): Promise<ProjectPhase[]> {
    return [...this.byId.values()].filter(
      (p) => !this.archived.has(p.id) && p.status === PhaseStatus.ACTIVE,
    );
  }
  async save(phase: ProjectPhase): Promise<void> {
    this.byId.set(phase.id, phase);
  }
  async update(phase: ProjectPhase): Promise<void> {
    this.byId.set(phase.id, phase);
  }
  async archive(id: ProjectPhaseId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: ProjectPhaseId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemoryDeliverableRepository implements DeliverableRepository {
  private readonly byId = new Map<string, Deliverable>();
  private readonly archived = new Set<string>();

  async findById(id: DeliverableId): Promise<Deliverable | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Deliverable[]> {
    return [...this.byId.values()].filter(
      (d) => d.organizationId === organizationId && !this.archived.has(d.id),
    );
  }
  async findByProject(projectId: ProjectId): Promise<Deliverable[]> {
    return [...this.byId.values()].filter(
      (d) => d.projectId === projectId && !this.archived.has(d.id),
    );
  }
  async findActive(): Promise<Deliverable[]> {
    return [...this.byId.values()].filter(
      (d) =>
        !this.archived.has(d.id) &&
        d.status !== DeliverableStatus.DELIVERED,
    );
  }
  async save(d: Deliverable): Promise<void> {
    this.byId.set(d.id, d);
  }
  async update(d: Deliverable): Promise<void> {
    this.byId.set(d.id, d);
  }
  async archive(id: DeliverableId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: DeliverableId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemoryProjectDependencyRepository
  implements ProjectDependencyRepository
{
  private readonly byId = new Map<string, ProjectDependency>();
  private readonly archived = new Set<string>();

  async findById(id: ProjectDependencyId): Promise<ProjectDependency | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ProjectDependency[]> {
    return [...this.byId.values()].filter(
      (d) => d.organizationId === organizationId && !this.archived.has(d.id),
    );
  }
  async findByProject(projectId: ProjectId): Promise<ProjectDependency[]> {
    return [...this.byId.values()].filter(
      (d) => d.projectId === projectId && !this.archived.has(d.id),
    );
  }
  async findDependingOn(projectId: ProjectId): Promise<ProjectDependency[]> {
    return [...this.byId.values()].filter(
      (d) => d.dependsOnProjectId === projectId && !this.archived.has(d.id),
    );
  }
  async findActive(): Promise<ProjectDependency[]> {
    return [...this.byId.values()].filter(
      (d) =>
        !this.archived.has(d.id) && d.status === DependencyStatus.ACTIVE,
    );
  }
  async save(d: ProjectDependency): Promise<void> {
    this.byId.set(d.id, d);
  }
  async update(d: ProjectDependency): Promise<void> {
    this.byId.set(d.id, d);
  }
  async archive(id: ProjectDependencyId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: ProjectDependencyId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemoryProjectObjectiveRepository
  implements ProjectObjectiveRepository
{
  private readonly byId = new Map<string, ProjectObjective>();
  private readonly archived = new Set<string>();

  async findById(id: ProjectObjectiveId): Promise<ProjectObjective | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ProjectObjective[]> {
    return [...this.byId.values()].filter(
      (o) => o.organizationId === organizationId && !this.archived.has(o.id),
    );
  }
  async findByProject(projectId: ProjectId): Promise<ProjectObjective[]> {
    return [...this.byId.values()].filter(
      (o) => o.projectId === projectId && !this.archived.has(o.id),
    );
  }
  async findActive(): Promise<ProjectObjective[]> {
    return [...this.byId.values()].filter(
      (o) =>
        !this.archived.has(o.id) &&
        o.status !== ObjectiveStatus.ACHIEVED &&
        o.status !== ObjectiveStatus.FAILED,
    );
  }
  async save(o: ProjectObjective): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: ProjectObjective): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: ProjectObjectiveId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: ProjectObjectiveId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}
