import {
  DeliveryReceipt,
  type CreateDeliveryReceiptProps,
} from "../aggregates/DeliveryReceipt/DeliveryReceipt.js";
import { DeliveryStatus } from "../enums/DeliveryStatus.js";
import {
  DeliveryNotFoundError,
  InvalidDeliveryStateError,
  ReceiptNotFoundError,
} from "../errors/DeliveryErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ReceiptPolicy } from "../policies/ReceiptPolicy.js";
import type { DeliveryReceiptRepository } from "../repositories/DeliveryReceiptRepository.js";
import type { DeliveryRepository } from "../repositories/DeliveryRepository.js";
import type { DeliveryId, DeliveryReceiptId } from "../types/ids.js";

export type ReceiptServiceDeps = {
  deliveryReceiptRepository: DeliveryReceiptRepository;
  deliveryRepository: DeliveryRepository;
  eventPublisher: DomainEventPublisher;
};

export class ReceiptService {
  constructor(private readonly deps: ReceiptServiceDeps) {}

  async create(props: CreateDeliveryReceiptProps): Promise<DeliveryReceipt> {
    const delivery = await this.deps.deliveryRepository.findById(
      props.deliveryId,
    );
    if (!delivery) throw new DeliveryNotFoundError(props.deliveryId);
    if (
      delivery.status !== DeliveryStatus.DELIVERED &&
      delivery.status !== DeliveryStatus.CONFIRMED
    ) {
      throw new InvalidDeliveryStateError(
        "Receipts can only be created for delivered work.",
      );
    }

    const existing = await this.deps.deliveryReceiptRepository.findByDelivery(
      props.deliveryId,
    );
    ReceiptPolicy.assertOnePerRecipient(
      existing,
      props.deliveryId,
      props.recipientId,
    );

    const receipt = DeliveryReceipt.create(props);
    await this.deps.deliveryReceiptRepository.save(receipt);
    await this.deps.eventPublisher.publish(receipt.pullDomainEvents());
    return receipt;
  }

  async confirm(
    id: DeliveryReceiptId,
    now?: Date,
  ): Promise<DeliveryReceipt> {
    const receipt = await this.getById(id);
    ReceiptPolicy.assertPending(receipt);
    receipt.confirm(now);
    await this.deps.deliveryReceiptRepository.update(receipt);
    await this.deps.eventPublisher.publish(receipt.pullDomainEvents());
    return receipt;
  }

  async reject(
    id: DeliveryReceiptId,
    now?: Date,
  ): Promise<DeliveryReceipt> {
    const receipt = await this.getById(id);
    ReceiptPolicy.assertPending(receipt);
    receipt.reject(now);
    await this.deps.deliveryReceiptRepository.update(receipt);
    await this.deps.eventPublisher.publish(receipt.pullDomainEvents());
    return receipt;
  }

  async getById(id: DeliveryReceiptId): Promise<DeliveryReceipt> {
    const receipt = await this.deps.deliveryReceiptRepository.findById(id);
    if (!receipt) throw new ReceiptNotFoundError(id);
    return receipt;
  }

  async listByDelivery(deliveryId: DeliveryId): Promise<DeliveryReceipt[]> {
    return this.deps.deliveryReceiptRepository.findByDelivery(deliveryId);
  }
}
