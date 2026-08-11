import {
  ProjectPhase,
  type CreateProjectPhaseProps,
} from "../aggregates/ProjectPhase/ProjectPhase.js";
import {
  ProjectNotFoundError,
  ProjectPhaseNotFoundError,
} from "../errors/ProjectErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { PhasePolicy } from "../policies/PhasePolicy.js";
import { ProjectLifecyclePolicy } from "../policies/ProjectLifecyclePolicy.js";
import type { ProjectPhaseRepository } from "../repositories/ProjectPhaseRepository.js";
import type { ProjectRepository } from "../repositories/ProjectRepository.js";
import type { ProjectId, ProjectPhaseId } from "../types/ids.js";

export type PhaseServiceDeps = {
  projectPhaseRepository: ProjectPhaseRepository;
  projectRepository: ProjectRepository;
  eventPublisher: DomainEventPublisher;
};

export class PhaseService {
  constructor(private readonly deps: PhaseServiceDeps) {}

  async create(props: CreateProjectPhaseProps): Promise<ProjectPhase> {
    const project = await this.deps.projectRepository.findById(props.projectId);
    if (!project) throw new ProjectNotFoundError(props.projectId);
    ProjectLifecyclePolicy.assertAcceptsChildActivity(project);

    const existing = await this.deps.projectPhaseRepository.findByProject(
      props.projectId,
    );
    PhasePolicy.assertUniqueSequence(existing, props.sequence);
    PhasePolicy.assertNoGaps(existing, props.sequence);

    const phase = ProjectPhase.create(props);
    await this.deps.projectPhaseRepository.save(phase);
    await this.deps.eventPublisher.publish(phase.pullDomainEvents());
    return phase;
  }

  async start(id: ProjectPhaseId, now?: Date): Promise<ProjectPhase> {
    const phase = await this.getById(id);
    const siblings = await this.deps.projectPhaseRepository.findByProject(
      phase.projectId,
    );
    PhasePolicy.assertSingleActive(siblings, phase.id);
    PhasePolicy.assertOrderedStart(siblings, phase);
    phase.start(now);
    await this.deps.projectPhaseRepository.update(phase);
    await this.deps.eventPublisher.publish(phase.pullDomainEvents());
    return phase;
  }

  async complete(id: ProjectPhaseId, now?: Date): Promise<ProjectPhase> {
    const phase = await this.getById(id);
    phase.complete(now);
    await this.deps.projectPhaseRepository.update(phase);
    await this.deps.eventPublisher.publish(phase.pullDomainEvents());
    return phase;
  }

  async getById(id: ProjectPhaseId): Promise<ProjectPhase> {
    const phase = await this.deps.projectPhaseRepository.findById(id);
    if (!phase) throw new ProjectPhaseNotFoundError(id);
    return phase;
  }

  async listByProject(projectId: ProjectId): Promise<ProjectPhase[]> {
    return this.deps.projectPhaseRepository.findByProject(projectId);
  }
}
