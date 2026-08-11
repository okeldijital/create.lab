import type { WorkOrder } from "../aggregates/WorkOrder/WorkOrder.js";
import {
  WorkOrderStatus,
  canTransitionWorkOrder,
} from "../enums/WorkOrderStatus.js";
import { InvalidWorkStateError } from "../errors/OperationsErrors.js";

/**
 * State transition and lifecycle invariants for WorkOrder.
 */
export class WorkLifecyclePolicy {
  static assertCanTransition(
    order: WorkOrder,
    to: WorkOrderStatus,
  ): void {
    if (order.status === WorkOrderStatus.CLOSED) {
      throw new InvalidWorkStateError(
        "Closed work orders cannot be reopened or transitioned.",
      );
    }
    if (!canTransitionWorkOrder(order.status, to)) {
      throw new InvalidWorkStateError(
        `Illegal work order transition: ${order.status} → ${to}.`,
      );
    }
  }

  static assertCanStart(order: WorkOrder): void {
    WorkLifecyclePolicy.assertCanTransition(
      order,
      WorkOrderStatus.IN_PROGRESS,
    );
  }

  static assertCanComplete(order: WorkOrder): void {
    if (!order.actualStart) {
      throw new InvalidWorkStateError(
        "Cannot complete work order before it has been started.",
      );
    }
    WorkLifecyclePolicy.assertCanTransition(order, WorkOrderStatus.COMPLETED);
  }

  static assertCanClose(order: WorkOrder): void {
    WorkLifecyclePolicy.assertCanTransition(order, WorkOrderStatus.CLOSED);
  }

  static assertMutable(order: WorkOrder): void {
    if (order.isClosed) {
      throw new InvalidWorkStateError(
        "Closed work orders cannot be modified.",
      );
    }
  }

  static assertAcceptsExecution(order: WorkOrder): void {
    if (
      order.status === WorkOrderStatus.CLOSED ||
      order.status === WorkOrderStatus.CANCELLED ||
      order.status === WorkOrderStatus.COMPLETED
    ) {
      throw new InvalidWorkStateError(
        `Work order in status ${order.status} cannot accept execution activity.`,
      );
    }
  }
}
