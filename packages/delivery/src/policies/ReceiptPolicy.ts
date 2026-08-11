import type { DeliveryReceipt } from "../aggregates/DeliveryReceipt/DeliveryReceipt.js";
import { ReceiptStatus } from "../enums/ReceiptStatus.js";
import {
  DuplicateReceiptError,
  InvalidDeliveryStateError,
} from "../errors/DeliveryErrors.js";
import type { DeliveryId } from "../types/ids.js";
import { RecipientReference } from "../value-objects/RecipientReference.js";

export class ReceiptPolicy {
  static assertOnePerRecipient(
    existing: readonly DeliveryReceipt[],
    deliveryId: DeliveryId,
    recipientId: string,
  ): void {
    const recipient = RecipientReference.create(recipientId);
    const dup = existing.find(
      (r) =>
        r.deliveryId === deliveryId &&
        r.recipientId === recipient.value,
    );
    if (dup) {
      throw new DuplicateReceiptError(recipient.value, deliveryId);
    }
  }

  static assertPending(receipt: DeliveryReceipt): void {
    if (receipt.status !== ReceiptStatus.PENDING) {
      throw new InvalidDeliveryStateError(
        `Receipt already ${receipt.status.toLowerCase()}; cannot confirm twice.`,
      );
    }
  }
}
