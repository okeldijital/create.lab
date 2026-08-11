import {
  ProjectDependency,
  type CreateProjectDependencyProps,
} from "../aggregates/ProjectDependency/ProjectDependency.js";
import {
  ProjectDependencyNotFoundError,
  ProjectNotFoundError,
} from "../errors/ProjectErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { DependencyPolicy } from "../policies/DependencyPolicy.js";
import { ProjectLifecyclePolicy } from "../policies/ProjectLifecyclePolicy.js";
import type { ProjectDependencyRepository } from "../repositories/ProjectDependencyRepository.js";
import type { ProjectRepository } from "../repositories/ProjectRepository.js";
import type { ProjectDependencyId, ProjectId } from "../types/ids.js";

export type DependencyServiceDeps = {
  projectDependencyRepository: ProjectDependencyRepository;
  projectRepository: ProjectRepository;
  eventPublisher: DomainEventPublisher;
};

export class DependencyService {
  constructor(private readonly deps: DependencyServiceDeps) {}

  async create(
    props: CreateProjectDependencyProps,
  ): Promise<ProjectDependency> {
    const project = await this.deps.projectRepository.findById(props.projectId);
    if (!project) throw new ProjectNotFoundError(props.projectId);
    ProjectLifecyclePolicy.assertAcceptsChildActivity(project);

    const target = await this.deps.projectRepository.findById(
      props.dependsOnProjectId,
    );
    if (!target) {
      throw new ProjectNotFoundError(props.dependsOnProjectId);
    }

    // Load all org deps for cycle detection across projects
    const orgDeps =
      await this.deps.projectDependencyRepository.findByOrganization(
        props.organizationId,
      );
    DependencyPolicy.assertNoCycle(
      orgDeps,
      props.projectId,
      props.dependsOnProjectId,
    );

    const dependency = ProjectDependency.create(props);
    await this.deps.projectDependencyRepository.save(dependency);
    await this.deps.eventPublisher.publish(dependency.pullDomainEvents());
    return dependency;
  }

  async resolve(
    id: ProjectDependencyId,
    now?: Date,
  ): Promise<ProjectDependency> {
    const dependency = await this.getById(id);
    dependency.resolve(now);
    await this.deps.projectDependencyRepository.update(dependency);
    await this.deps.eventPublisher.publish(dependency.pullDomainEvents());
    return dependency;
  }

  async getById(id: ProjectDependencyId): Promise<ProjectDependency> {
    const dependency =
      await this.deps.projectDependencyRepository.findById(id);
    if (!dependency) throw new ProjectDependencyNotFoundError(id);
    return dependency;
  }

  async listByProject(projectId: ProjectId): Promise<ProjectDependency[]> {
    return this.deps.projectDependencyRepository.findByProject(projectId);
  }
}
