import type { Delivery } from "../aggregates/Delivery/Delivery.js";
import {
  DeliveryStatus,
  canTransitionDelivery,
} from "../enums/DeliveryStatus.js";
import { InvalidDeliveryStateError } from "../errors/DeliveryErrors.js";

export class DeliveryLifecyclePolicy {
  static assertCanTransition(delivery: Delivery, to: DeliveryStatus): void {
    if (delivery.isArchived) {
      throw new InvalidDeliveryStateError(
        "Archived deliveries are immutable.",
      );
    }
    if (!canTransitionDelivery(delivery.status, to)) {
      throw new InvalidDeliveryStateError(
        `Illegal delivery transition: ${delivery.status} → ${to}.`,
      );
    }
  }

  static assertMutable(delivery: Delivery): void {
    if (delivery.isArchived) {
      throw new InvalidDeliveryStateError(
        "Archived deliveries are immutable.",
      );
    }
  }

  static assertCanDeliver(delivery: Delivery): void {
    DeliveryLifecyclePolicy.assertCanTransition(
      delivery,
      DeliveryStatus.DELIVERED,
    );
  }

  static assertCanConfirm(delivery: Delivery): void {
    if (delivery.status !== DeliveryStatus.DELIVERED) {
      throw new InvalidDeliveryStateError(
        "Cannot confirm before delivery.",
      );
    }
  }
}
