import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  Project,
  type CreateProjectProps,
} from "../aggregates/Project/Project.js";
import { ProjectStatus } from "../enums/ProjectStatus.js";
import { ProjectNotFoundError } from "../errors/ProjectErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ProjectLifecyclePolicy } from "../policies/ProjectLifecyclePolicy.js";
import type { ProjectRepository } from "../repositories/ProjectRepository.js";
import type { ProjectId } from "../types/ids.js";

export type ProjectServiceDeps = {
  projectRepository: ProjectRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class ProjectService {
  constructor(private readonly deps: ProjectServiceDeps) {}

  async create(props: CreateProjectProps): Promise<Project> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const existing = await this.deps.projectRepository.findByOrganization(
      props.organizationId,
    );
    ProjectLifecyclePolicy.assertUniqueName(
      existing,
      props.name,
      props.organizationId,
    );

    const project = Project.create(props);
    await this.deps.projectRepository.save(project);
    await this.deps.eventPublisher.publish(project.pullDomainEvents());
    return project;
  }

  async getById(id: ProjectId): Promise<Project> {
    const project = await this.deps.projectRepository.findById(id);
    if (!project) throw new ProjectNotFoundError(id);
    return project;
  }

  async plan(id: ProjectId, now?: Date): Promise<Project> {
    const project = await this.getById(id);
    ProjectLifecyclePolicy.assertCanTransition(
      project,
      ProjectStatus.PLANNING,
    );
    project.plan(now);
    await this.deps.projectRepository.update(project);
    await this.deps.eventPublisher.publish(project.pullDomainEvents());
    return project;
  }

  async start(id: ProjectId, now?: Date): Promise<Project> {
    const project = await this.getById(id);
    ProjectLifecyclePolicy.assertCanTransition(project, ProjectStatus.ACTIVE);
    project.start(now);
    await this.deps.projectRepository.update(project);
    await this.deps.eventPublisher.publish(project.pullDomainEvents());
    return project;
  }

  async hold(id: ProjectId, now?: Date): Promise<Project> {
    const project = await this.getById(id);
    project.hold(now);
    await this.deps.projectRepository.update(project);
    await this.deps.eventPublisher.publish(project.pullDomainEvents());
    return project;
  }

  async resume(id: ProjectId, now?: Date): Promise<Project> {
    const project = await this.getById(id);
    project.resume(now);
    await this.deps.projectRepository.update(project);
    await this.deps.eventPublisher.publish(project.pullDomainEvents());
    return project;
  }

  async complete(id: ProjectId, now?: Date): Promise<Project> {
    const project = await this.getById(id);
    ProjectLifecyclePolicy.assertCanTransition(
      project,
      ProjectStatus.COMPLETED,
    );
    project.complete(now);
    await this.deps.projectRepository.update(project);
    await this.deps.eventPublisher.publish(project.pullDomainEvents());
    return project;
  }

  async cancel(id: ProjectId, now?: Date): Promise<Project> {
    const project = await this.getById(id);
    project.cancel(now);
    await this.deps.projectRepository.update(project);
    await this.deps.eventPublisher.publish(project.pullDomainEvents());
    return project;
  }

  async close(id: ProjectId, now?: Date): Promise<Project> {
    const project = await this.getById(id);
    ProjectLifecyclePolicy.assertCanTransition(project, ProjectStatus.CLOSED);
    project.close(now);
    await this.deps.projectRepository.update(project);
    await this.deps.eventPublisher.publish(project.pullDomainEvents());
    return project;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Project[]> {
    return this.deps.projectRepository.findByOrganization(organizationId);
  }

  async listByOwner(ownerId: string): Promise<Project[]> {
    return this.deps.projectRepository.findByOwner(ownerId);
  }

  async listActive(): Promise<Project[]> {
    return this.deps.projectRepository.findActive();
  }
}
