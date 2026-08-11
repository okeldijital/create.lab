import type { AllocationId } from "../types/ids.js";
import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import type { BookingId } from "@creative-lab/scheduling";
import {
  WorkOrder,
  type CreateWorkOrderProps,
} from "../aggregates/WorkOrder/WorkOrder.js";
import { WorkOrderStatus } from "../enums/WorkOrderStatus.js";
import {
  InvalidWorkStateError,
  WorkOrderNotFoundError,
} from "../errors/OperationsErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { WorkLifecyclePolicy } from "../policies/WorkLifecyclePolicy.js";
import type { WorkOrderRepository } from "../repositories/WorkOrderRepository.js";
import type { WorkOrderId } from "../types/ids.js";

export type WorkOrderServiceDeps = {
  workOrderRepository: WorkOrderRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
  /** Optional: verify allocation exists and is active. */
  allocationExists?: (allocationId: AllocationId) => Promise<boolean>;
  /** Optional: verify booking exists. */
  bookingExists?: (bookingId: BookingId) => Promise<boolean>;
};

export class WorkOrderService {
  constructor(private readonly deps: WorkOrderServiceDeps) {}

  async create(props: CreateWorkOrderProps): Promise<WorkOrder> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    if (this.deps.allocationExists) {
      const ok = await this.deps.allocationExists(props.allocationId);
      if (!ok) {
        throw new InvalidWorkStateError(
          `Allocation not found: ${props.allocationId}`,
        );
      }
    }
    if (this.deps.bookingExists) {
      const ok = await this.deps.bookingExists(props.bookingId);
      if (!ok) {
        throw new InvalidWorkStateError(
          `Booking not found: ${props.bookingId}`,
        );
      }
    }

    const order = WorkOrder.create(props);
    await this.deps.workOrderRepository.save(order);
    await this.deps.eventPublisher.publish(order.pullDomainEvents());
    return order;
  }

  async getById(id: WorkOrderId): Promise<WorkOrder> {
    const order = await this.deps.workOrderRepository.findById(id);
    if (!order) throw new WorkOrderNotFoundError(id);
    return order;
  }

  async markReady(id: WorkOrderId, now?: Date): Promise<WorkOrder> {
    const order = await this.getById(id);
    WorkLifecyclePolicy.assertCanTransition(order, WorkOrderStatus.READY);
    order.markReady(now);
    await this.deps.workOrderRepository.update(order);
    await this.deps.eventPublisher.publish(order.pullDomainEvents());
    return order;
  }

  async start(id: WorkOrderId, now?: Date): Promise<WorkOrder> {
    const order = await this.getById(id);
    WorkLifecyclePolicy.assertCanStart(order);
    order.start(now);
    await this.deps.workOrderRepository.update(order);
    await this.deps.eventPublisher.publish(order.pullDomainEvents());
    return order;
  }

  async pause(id: WorkOrderId, now?: Date): Promise<WorkOrder> {
    const order = await this.getById(id);
    order.pause(now);
    await this.deps.workOrderRepository.update(order);
    await this.deps.eventPublisher.publish(order.pullDomainEvents());
    return order;
  }

  async resume(id: WorkOrderId, now?: Date): Promise<WorkOrder> {
    const order = await this.getById(id);
    order.resume(now);
    await this.deps.workOrderRepository.update(order);
    await this.deps.eventPublisher.publish(order.pullDomainEvents());
    return order;
  }

  async complete(id: WorkOrderId, now?: Date): Promise<WorkOrder> {
    const order = await this.getById(id);
    WorkLifecyclePolicy.assertCanComplete(order);
    order.complete(now);
    await this.deps.workOrderRepository.update(order);
    await this.deps.eventPublisher.publish(order.pullDomainEvents());
    return order;
  }

  async cancel(id: WorkOrderId, now?: Date): Promise<WorkOrder> {
    const order = await this.getById(id);
    order.cancel(now);
    await this.deps.workOrderRepository.update(order);
    await this.deps.eventPublisher.publish(order.pullDomainEvents());
    return order;
  }

  async close(id: WorkOrderId, now?: Date): Promise<WorkOrder> {
    const order = await this.getById(id);
    WorkLifecyclePolicy.assertCanClose(order);
    order.close(now);
    await this.deps.workOrderRepository.update(order);
    await this.deps.eventPublisher.publish(order.pullDomainEvents());
    return order;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkOrder[]> {
    return this.deps.workOrderRepository.findByOrganization(organizationId);
  }

  async listByAllocation(
    allocationId: AllocationId,
  ): Promise<WorkOrder[]> {
    return this.deps.workOrderRepository.findByAllocation(allocationId);
  }

  async listByBooking(bookingId: BookingId): Promise<WorkOrder[]> {
    return this.deps.workOrderRepository.findByBooking(bookingId);
  }

  async listActive(): Promise<WorkOrder[]> {
    return this.deps.workOrderRepository.findActive();
  }
}
