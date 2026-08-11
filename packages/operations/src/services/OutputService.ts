import {
  WorkOutput,
  type CreateWorkOutputProps,
} from "../aggregates/WorkOutput/WorkOutput.js";
import {
  WorkOrderNotFoundError,
  WorkOutputNotFoundError,
} from "../errors/OperationsErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { OutputPolicy } from "../policies/OutputPolicy.js";
import { WorkLifecyclePolicy } from "../policies/WorkLifecyclePolicy.js";
import type { WorkOrderRepository } from "../repositories/WorkOrderRepository.js";
import type { WorkOutputRepository } from "../repositories/WorkOutputRepository.js";
import type { WorkOrderId, WorkOutputId } from "../types/ids.js";

export type OutputServiceDeps = {
  workOutputRepository: WorkOutputRepository;
  workOrderRepository: WorkOrderRepository;
  eventPublisher: DomainEventPublisher;
};

export class OutputService {
  constructor(private readonly deps: OutputServiceDeps) {}

  /**
   * Create output metadata. When version is omitted, auto-increments per
   * (workOrderId, name). Core identity fields are immutable after create.
   */
  async create(props: CreateWorkOutputProps): Promise<WorkOutput> {
    const order = await this.deps.workOrderRepository.findById(
      props.workOrderId,
    );
    if (!order) throw new WorkOrderNotFoundError(props.workOrderId);
    WorkLifecyclePolicy.assertAcceptsExecution(order);

    const all = await this.deps.workOutputRepository.findByWorkOrder(
      props.workOrderId,
    );
    const sameName = OutputPolicy.filterByName(all, props.name);

    let version = props.version;
    if (version === undefined) {
      version = OutputPolicy.nextVersion(sameName).value;
    } else {
      OutputPolicy.assertVersionAvailable(sameName, version);
    }

    const output = WorkOutput.create({ ...props, version });
    await this.deps.workOutputRepository.save(output);
    await this.deps.eventPublisher.publish(output.pullDomainEvents());
    return output;
  }

  async approve(id: WorkOutputId, now?: Date): Promise<WorkOutput> {
    const output = await this.getById(id);
    output.approve(now);
    await this.deps.workOutputRepository.update(output);
    await this.deps.eventPublisher.publish(output.pullDomainEvents());
    return output;
  }

  async submitForReview(id: WorkOutputId, now?: Date): Promise<WorkOutput> {
    const output = await this.getById(id);
    output.submitForReview(now);
    await this.deps.workOutputRepository.update(output);
    await this.deps.eventPublisher.publish(output.pullDomainEvents());
    return output;
  }

  async deliver(id: WorkOutputId, now?: Date): Promise<WorkOutput> {
    const output = await this.getById(id);
    output.deliver(now);
    await this.deps.workOutputRepository.update(output);
    await this.deps.eventPublisher.publish(output.pullDomainEvents());
    return output;
  }

  async getById(id: WorkOutputId): Promise<WorkOutput> {
    const output = await this.deps.workOutputRepository.findById(id);
    if (!output) throw new WorkOutputNotFoundError(id);
    return output;
  }

  async listByWorkOrder(workOrderId: WorkOrderId): Promise<WorkOutput[]> {
    return this.deps.workOutputRepository.findByWorkOrder(workOrderId);
  }
}
