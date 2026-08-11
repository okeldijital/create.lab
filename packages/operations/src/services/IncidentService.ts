import {
  WorkIncident,
  type CreateWorkIncidentProps,
} from "../aggregates/WorkIncident/WorkIncident.js";
import {
  WorkIncidentNotFoundError,
  WorkOrderNotFoundError,
} from "../errors/OperationsErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { IncidentPolicy } from "../policies/IncidentPolicy.js";
import type { WorkIncidentRepository } from "../repositories/WorkIncidentRepository.js";
import type { WorkOrderRepository } from "../repositories/WorkOrderRepository.js";
import type { WorkIncidentId, WorkOrderId } from "../types/ids.js";

export type IncidentServiceDeps = {
  workIncidentRepository: WorkIncidentRepository;
  workOrderRepository: WorkOrderRepository;
  eventPublisher: DomainEventPublisher;
};

export class IncidentService {
  constructor(private readonly deps: IncidentServiceDeps) {}

  async report(props: CreateWorkIncidentProps): Promise<WorkIncident> {
    const order = await this.deps.workOrderRepository.findById(
      props.workOrderId,
    );
    if (!order) throw new WorkOrderNotFoundError(props.workOrderId);

    const incident = WorkIncident.create(props);
    await this.deps.workIncidentRepository.save(incident);
    await this.deps.eventPublisher.publish(incident.pullDomainEvents());
    return incident;
  }

  async resolve(
    id: WorkIncidentId,
    resolution: string,
    now?: Date,
  ): Promise<WorkIncident> {
    const incident = await this.getById(id);
    IncidentPolicy.assertCanResolve(incident, resolution);
    incident.resolve(resolution, now);
    await this.deps.workIncidentRepository.update(incident);
    await this.deps.eventPublisher.publish(incident.pullDomainEvents());
    return incident;
  }

  async getById(id: WorkIncidentId): Promise<WorkIncident> {
    const incident = await this.deps.workIncidentRepository.findById(id);
    if (!incident) throw new WorkIncidentNotFoundError(id);
    return incident;
  }

  async listByWorkOrder(workOrderId: WorkOrderId): Promise<WorkIncident[]> {
    return this.deps.workIncidentRepository.findByWorkOrder(workOrderId);
  }
}
