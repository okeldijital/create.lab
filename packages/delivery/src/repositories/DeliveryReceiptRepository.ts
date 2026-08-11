import type { DeliveryReceipt } from "../aggregates/DeliveryReceipt/DeliveryReceipt.js";
import type { DeliveryId, DeliveryReceiptId } from "../types/ids.js";

export interface DeliveryReceiptRepository {
  findById(id: DeliveryReceiptId): Promise<DeliveryReceipt | null>;
  findByDelivery(deliveryId: DeliveryId): Promise<DeliveryReceipt[]>;
  findByRecipient(
    deliveryId: DeliveryId,
    recipientId: string,
  ): Promise<DeliveryReceipt | null>;
  save(receipt: DeliveryReceipt): Promise<void>;
  update(receipt: DeliveryReceipt): Promise<void>;
}
