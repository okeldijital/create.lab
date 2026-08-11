import { DomainError } from "@creative-lab/core";

export class DeliveryNotFoundError extends DomainError {
  readonly code = "DELIVERY_NOT_FOUND";
  constructor(identifier: string) {
    super(`Delivery not found: ${identifier}`);
  }
}

export class PackageNotFoundError extends DomainError {
  readonly code = "PACKAGE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Delivery package not found: ${identifier}`);
  }
}

export class ItemNotFoundError extends DomainError {
  readonly code = "ITEM_NOT_FOUND";
  constructor(identifier: string) {
    super(`Delivery item not found: ${identifier}`);
  }
}

export class ReceiptNotFoundError extends DomainError {
  readonly code = "RECEIPT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Delivery receipt not found: ${identifier}`);
  }
}

export class InvalidDeliveryStateError extends DomainError {
  readonly code = "INVALID_DELIVERY_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class PackageAlreadySealedError extends DomainError {
  readonly code = "PACKAGE_ALREADY_SEALED";
  constructor(packageId: string) {
    super(`Delivery package "${packageId}" is sealed and immutable.`);
  }
}

export class DuplicateDeliveryItemError extends DomainError {
  readonly code = "DUPLICATE_DELIVERY_ITEM";
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateReceiptError extends DomainError {
  readonly code = "DUPLICATE_RECEIPT";
  constructor(recipientId: string, deliveryId: string) {
    super(
      `Recipient "${recipientId}" already has a receipt for delivery "${deliveryId}".`,
    );
  }
}

export class DeliveryValidationError extends DomainError {
  readonly code = "DELIVERY_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
