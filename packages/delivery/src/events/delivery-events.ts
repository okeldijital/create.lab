import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { DeliveryStatus } from "../enums/DeliveryStatus.js";
import type { PackageStatus } from "../enums/PackageStatus.js";
import type { ReceiptStatus } from "../enums/ReceiptStatus.js";
import type {
  DeliveryId,
  DeliveryItemId,
  DeliveryPackageId,
  DeliveryReceiptId,
} from "../types/ids.js";

export class DeliveryCreated extends DomainEvent<
  "DeliveryCreated",
  Readonly<{
    deliveryId: string;
    projectId: string;
    productionId: string;
    reviewId: string;
    referenceNumber: string;
    status: DeliveryStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    deliveryId: DeliveryId;
    projectId: string;
    productionId: string;
    reviewId: string;
    referenceNumber: string;
    status: DeliveryStatus;
    occurredAt?: Date;
  }): DeliveryCreated {
    return new DeliveryCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "DeliveryCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.deliveryId,
      organizationId: input.organizationId,
      payload: {
        deliveryId: input.deliveryId,
        projectId: input.projectId,
        productionId: input.productionId,
        reviewId: input.reviewId,
        referenceNumber: input.referenceNumber,
        status: input.status,
      },
    });
  }
}

export class DeliveryReady extends DomainEvent<
  "DeliveryReady",
  Readonly<{ deliveryId: string }>
> {
  static create(input: {
    organizationId: string;
    deliveryId: DeliveryId;
    occurredAt?: Date;
  }): DeliveryReady {
    return new DeliveryReady({
      eventId: DomainEvent.nextEventId(),
      eventType: "DeliveryReady",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.deliveryId,
      organizationId: input.organizationId,
      payload: { deliveryId: input.deliveryId },
    });
  }
}

export class DeliveryDelivered extends DomainEvent<
  "DeliveryDelivered",
  Readonly<{ deliveryId: string; deliveredAt: string }>
> {
  static create(input: {
    organizationId: string;
    deliveryId: DeliveryId;
    deliveredAt: Date;
    occurredAt?: Date;
  }): DeliveryDelivered {
    return new DeliveryDelivered({
      eventId: DomainEvent.nextEventId(),
      eventType: "DeliveryDelivered",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.deliveryId,
      organizationId: input.organizationId,
      payload: {
        deliveryId: input.deliveryId,
        deliveredAt: input.deliveredAt.toISOString(),
      },
    });
  }
}

export class DeliveryConfirmed extends DomainEvent<
  "DeliveryConfirmed",
  Readonly<{ deliveryId: string; completedAt: string }>
> {
  static create(input: {
    organizationId: string;
    deliveryId: DeliveryId;
    completedAt: Date;
    occurredAt?: Date;
  }): DeliveryConfirmed {
    return new DeliveryConfirmed({
      eventId: DomainEvent.nextEventId(),
      eventType: "DeliveryConfirmed",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.deliveryId,
      organizationId: input.organizationId,
      payload: {
        deliveryId: input.deliveryId,
        completedAt: input.completedAt.toISOString(),
      },
    });
  }
}

export class DeliveryArchived extends DomainEvent<
  "DeliveryArchived",
  Readonly<{ deliveryId: string }>
> {
  static create(input: {
    organizationId: string;
    deliveryId: DeliveryId;
    occurredAt?: Date;
  }): DeliveryArchived {
    return new DeliveryArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "DeliveryArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.deliveryId,
      organizationId: input.organizationId,
      payload: { deliveryId: input.deliveryId },
    });
  }
}

export class PackageCreated extends DomainEvent<
  "PackageCreated",
  Readonly<{ packageId: string; deliveryId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    packageId: DeliveryPackageId;
    deliveryId: DeliveryId;
    name: string;
    occurredAt?: Date;
  }): PackageCreated {
    return new PackageCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "PackageCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.packageId,
      organizationId: input.organizationId,
      payload: {
        packageId: input.packageId,
        deliveryId: input.deliveryId,
        name: input.name,
      },
    });
  }
}

export class PackageSealed extends DomainEvent<
  "PackageSealed",
  Readonly<{ packageId: string; deliveryId: string }>
> {
  static create(input: {
    organizationId: string;
    packageId: DeliveryPackageId;
    deliveryId: DeliveryId;
    occurredAt?: Date;
  }): PackageSealed {
    return new PackageSealed({
      eventId: DomainEvent.nextEventId(),
      eventType: "PackageSealed",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.packageId,
      organizationId: input.organizationId,
      payload: {
        packageId: input.packageId,
        deliveryId: input.deliveryId,
      },
    });
  }
}

export class PackageArchived extends DomainEvent<
  "PackageArchived",
  Readonly<{ packageId: string }>
> {
  static create(input: {
    organizationId: string;
    packageId: DeliveryPackageId;
    occurredAt?: Date;
  }): PackageArchived {
    return new PackageArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "PackageArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.packageId,
      organizationId: input.organizationId,
      payload: { packageId: input.packageId },
    });
  }
}

export class ItemAdded extends DomainEvent<
  "ItemAdded",
  Readonly<{
    itemId: string;
    packageId: string;
    assetId: string;
    assetVersionId: string;
  }>
> {
  static create(input: {
    organizationId: string;
    itemId: DeliveryItemId;
    packageId: DeliveryPackageId;
    assetId: string;
    assetVersionId: string;
    occurredAt?: Date;
  }): ItemAdded {
    return new ItemAdded({
      eventId: DomainEvent.nextEventId(),
      eventType: "ItemAdded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.itemId,
      organizationId: input.organizationId,
      payload: {
        itemId: input.itemId,
        packageId: input.packageId,
        assetId: input.assetId,
        assetVersionId: input.assetVersionId,
      },
    });
  }
}

export class ItemRemoved extends DomainEvent<
  "ItemRemoved",
  Readonly<{ itemId: string; packageId: string }>
> {
  static create(input: {
    organizationId: string;
    itemId: DeliveryItemId;
    packageId: DeliveryPackageId;
    occurredAt?: Date;
  }): ItemRemoved {
    return new ItemRemoved({
      eventId: DomainEvent.nextEventId(),
      eventType: "ItemRemoved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.itemId,
      organizationId: input.organizationId,
      payload: {
        itemId: input.itemId,
        packageId: input.packageId,
      },
    });
  }
}

export class ReceiptCreated extends DomainEvent<
  "ReceiptCreated",
  Readonly<{
    receiptId: string;
    deliveryId: string;
    recipientId: string;
    status: ReceiptStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    receiptId: DeliveryReceiptId;
    deliveryId: DeliveryId;
    recipientId: string;
    status: ReceiptStatus;
    occurredAt?: Date;
  }): ReceiptCreated {
    return new ReceiptCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReceiptCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.receiptId,
      organizationId: input.organizationId,
      payload: {
        receiptId: input.receiptId,
        deliveryId: input.deliveryId,
        recipientId: input.recipientId,
        status: input.status,
      },
    });
  }
}

export class ReceiptConfirmed extends DomainEvent<
  "ReceiptConfirmed",
  Readonly<{ receiptId: string; deliveryId: string }>
> {
  static create(input: {
    organizationId: string;
    receiptId: DeliveryReceiptId;
    deliveryId: DeliveryId;
    occurredAt?: Date;
  }): ReceiptConfirmed {
    return new ReceiptConfirmed({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReceiptConfirmed",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.receiptId,
      organizationId: input.organizationId,
      payload: {
        receiptId: input.receiptId,
        deliveryId: input.deliveryId,
      },
    });
  }
}

export class ReceiptRejected extends DomainEvent<
  "ReceiptRejected",
  Readonly<{ receiptId: string; deliveryId: string }>
> {
  static create(input: {
    organizationId: string;
    receiptId: DeliveryReceiptId;
    deliveryId: DeliveryId;
    occurredAt?: Date;
  }): ReceiptRejected {
    return new ReceiptRejected({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReceiptRejected",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.receiptId,
      organizationId: input.organizationId,
      payload: {
        receiptId: input.receiptId,
        deliveryId: input.deliveryId,
      },
    });
  }
}

export type { PackageStatus };
