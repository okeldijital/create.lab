import {
  ProjectObjective,
  type CreateProjectObjectiveProps,
} from "../aggregates/ProjectObjective/ProjectObjective.js";
import {
  ProjectNotFoundError,
  ProjectObjectiveNotFoundError,
} from "../errors/ProjectErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ObjectivePolicy } from "../policies/ObjectivePolicy.js";
import { ProjectLifecyclePolicy } from "../policies/ProjectLifecyclePolicy.js";
import type { ProjectObjectiveRepository } from "../repositories/ProjectObjectiveRepository.js";
import type { ProjectRepository } from "../repositories/ProjectRepository.js";
import type { ProjectId, ProjectObjectiveId } from "../types/ids.js";

export type ObjectiveServiceDeps = {
  projectObjectiveRepository: ProjectObjectiveRepository;
  projectRepository: ProjectRepository;
  eventPublisher: DomainEventPublisher;
};

export class ObjectiveService {
  constructor(private readonly deps: ObjectiveServiceDeps) {}

  async create(
    props: CreateProjectObjectiveProps,
  ): Promise<ProjectObjective> {
    const project = await this.deps.projectRepository.findById(props.projectId);
    if (!project) throw new ProjectNotFoundError(props.projectId);
    ProjectLifecyclePolicy.assertAcceptsChildActivity(project);

    const existing = await this.deps.projectObjectiveRepository.findByProject(
      props.projectId,
    );
    ObjectivePolicy.assertUniqueName(existing, props.name, props.projectId);

    const objective = ProjectObjective.create(props);
    await this.deps.projectObjectiveRepository.save(objective);
    await this.deps.eventPublisher.publish(objective.pullDomainEvents());
    return objective;
  }

  async updateProgress(
    id: ProjectObjectiveId,
    currentValue: number,
    now?: Date,
  ): Promise<ProjectObjective> {
    const objective = await this.getById(id);
    ObjectivePolicy.assertMutable(objective);
    objective.updateProgress(currentValue, now);
    await this.deps.projectObjectiveRepository.update(objective);
    await this.deps.eventPublisher.publish(objective.pullDomainEvents());
    return objective;
  }

  async achieve(
    id: ProjectObjectiveId,
    now?: Date,
  ): Promise<ProjectObjective> {
    const objective = await this.getById(id);
    objective.achieve(now);
    await this.deps.projectObjectiveRepository.update(objective);
    await this.deps.eventPublisher.publish(objective.pullDomainEvents());
    return objective;
  }

  async getById(id: ProjectObjectiveId): Promise<ProjectObjective> {
    const objective =
      await this.deps.projectObjectiveRepository.findById(id);
    if (!objective) throw new ProjectObjectiveNotFoundError(id);
    return objective;
  }

  async listByProject(projectId: ProjectId): Promise<ProjectObjective[]> {
    return this.deps.projectObjectiveRepository.findByProject(projectId);
  }
}
