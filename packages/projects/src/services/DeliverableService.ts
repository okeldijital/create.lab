import type { WorkOrderId } from "@creative-lab/operations";
import {
  Deliverable,
  type CreateDeliverableProps,
} from "../aggregates/Deliverable/Deliverable.js";
import {
  DeliverableNotFoundError,
  ProjectNotFoundError,
} from "../errors/ProjectErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { DeliverablePolicy } from "../policies/DeliverablePolicy.js";
import { ProjectLifecyclePolicy } from "../policies/ProjectLifecyclePolicy.js";
import type { DeliverableRepository } from "../repositories/DeliverableRepository.js";
import type { ProjectRepository } from "../repositories/ProjectRepository.js";
import type { DeliverableId, ProjectId } from "../types/ids.js";

export type DeliverableServiceDeps = {
  deliverableRepository: DeliverableRepository;
  projectRepository: ProjectRepository;
  eventPublisher: DomainEventPublisher;
};

export class DeliverableService {
  constructor(private readonly deps: DeliverableServiceDeps) {}

  async create(props: CreateDeliverableProps): Promise<Deliverable> {
    const project = await this.deps.projectRepository.findById(props.projectId);
    if (!project) throw new ProjectNotFoundError(props.projectId);
    ProjectLifecyclePolicy.assertAcceptsChildActivity(project);

    const existing = await this.deps.deliverableRepository.findByProject(
      props.projectId,
    );
    DeliverablePolicy.assertUniqueName(
      existing,
      props.name,
      props.projectId,
    );

    const deliverable = Deliverable.create(props);
    await this.deps.deliverableRepository.save(deliverable);
    await this.deps.eventPublisher.publish(deliverable.pullDomainEvents());
    return deliverable;
  }

  async complete(id: DeliverableId, now?: Date): Promise<Deliverable> {
    const deliverable = await this.getById(id);
    deliverable.complete(now);
    await this.deps.deliverableRepository.update(deliverable);
    await this.deps.eventPublisher.publish(deliverable.pullDomainEvents());
    return deliverable;
  }

  async start(id: DeliverableId, now?: Date): Promise<Deliverable> {
    const deliverable = await this.getById(id);
    deliverable.start(now);
    await this.deps.deliverableRepository.update(deliverable);
    await this.deps.eventPublisher.publish(deliverable.pullDomainEvents());
    return deliverable;
  }

  async linkWorkOrder(
    id: DeliverableId,
    workOrderId: WorkOrderId,
    now?: Date,
  ): Promise<Deliverable> {
    const deliverable = await this.getById(id);
    deliverable.linkWorkOrder(workOrderId, now);
    await this.deps.deliverableRepository.update(deliverable);
    await this.deps.eventPublisher.publish(deliverable.pullDomainEvents());
    return deliverable;
  }

  async getById(id: DeliverableId): Promise<Deliverable> {
    const deliverable = await this.deps.deliverableRepository.findById(id);
    if (!deliverable) throw new DeliverableNotFoundError(id);
    return deliverable;
  }

  async listByProject(projectId: ProjectId): Promise<Deliverable[]> {
    return this.deps.deliverableRepository.findByProject(projectId);
  }
}
