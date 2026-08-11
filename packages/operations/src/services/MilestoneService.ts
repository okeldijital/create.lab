import {
  WorkMilestone,
  type CreateWorkMilestoneProps,
} from "../aggregates/WorkMilestone/WorkMilestone.js";
import {
  WorkMilestoneNotFoundError,
  WorkOrderNotFoundError,
} from "../errors/OperationsErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { MilestonePolicy } from "../policies/MilestonePolicy.js";
import { WorkLifecyclePolicy } from "../policies/WorkLifecyclePolicy.js";
import type { WorkMilestoneRepository } from "../repositories/WorkMilestoneRepository.js";
import type { WorkOrderRepository } from "../repositories/WorkOrderRepository.js";
import type { WorkMilestoneId, WorkOrderId } from "../types/ids.js";

export type MilestoneServiceDeps = {
  workMilestoneRepository: WorkMilestoneRepository;
  workOrderRepository: WorkOrderRepository;
  eventPublisher: DomainEventPublisher;
};

export class MilestoneService {
  constructor(private readonly deps: MilestoneServiceDeps) {}

  async create(props: CreateWorkMilestoneProps): Promise<WorkMilestone> {
    const order = await this.deps.workOrderRepository.findById(
      props.workOrderId,
    );
    if (!order) throw new WorkOrderNotFoundError(props.workOrderId);
    WorkLifecyclePolicy.assertAcceptsExecution(order);

    const existing = await this.deps.workMilestoneRepository.findByWorkOrder(
      props.workOrderId,
    );
    MilestonePolicy.assertUniqueName(
      existing,
      props.name,
      props.workOrderId,
    );

    const milestone = WorkMilestone.create(props);
    await this.deps.workMilestoneRepository.save(milestone);
    await this.deps.eventPublisher.publish(milestone.pullDomainEvents());
    return milestone;
  }

  async complete(
    id: WorkMilestoneId,
    completedBy?: string | null,
    now?: Date,
  ): Promise<WorkMilestone> {
    const milestone = await this.getById(id);
    milestone.complete(completedBy, now);
    await this.deps.workMilestoneRepository.update(milestone);
    await this.deps.eventPublisher.publish(milestone.pullDomainEvents());
    return milestone;
  }

  async getById(id: WorkMilestoneId): Promise<WorkMilestone> {
    const milestone = await this.deps.workMilestoneRepository.findById(id);
    if (!milestone) throw new WorkMilestoneNotFoundError(id);
    return milestone;
  }

  async listByWorkOrder(workOrderId: WorkOrderId): Promise<WorkMilestone[]> {
    return this.deps.workMilestoneRepository.findByWorkOrder(workOrderId);
  }
}
