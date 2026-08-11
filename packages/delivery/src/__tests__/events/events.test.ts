import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { DeliveryStatus } from "../../enums/DeliveryStatus.js";
import { ReceiptStatus } from "../../enums/ReceiptStatus.js";
import {
  DeliveryArchived,
  DeliveryConfirmed,
  DeliveryCreated,
  DeliveryDelivered,
  DeliveryReady,
  ItemAdded,
  ItemRemoved,
  PackageArchived,
  PackageCreated,
  PackageSealed,
  ReceiptConfirmed,
  ReceiptCreated,
  ReceiptRejected,
} from "../../events/delivery-events.js";
import {
  asDeliveryId,
  asDeliveryItemId,
  asDeliveryPackageId,
  asDeliveryReceiptId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const deliveryId = asDeliveryId("del-1");

describe("Domain events", () => {
  it("are frozen and versioned", () => {
    const e = DeliveryCreated.create({
      organizationId: orgId,
      deliveryId,
      projectId: "p",
      productionId: "pr",
      reviewId: "r",
      referenceNumber: "DEL-1",
      status: DeliveryStatus.DRAFT,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
  });

  it("covers minimum event set", () => {
    const events = [
      DeliveryReady.create({ organizationId: orgId, deliveryId }),
      DeliveryDelivered.create({
        organizationId: orgId,
        deliveryId,
        deliveredAt: new Date(),
      }),
      DeliveryConfirmed.create({
        organizationId: orgId,
        deliveryId,
        completedAt: new Date(),
      }),
      DeliveryArchived.create({ organizationId: orgId, deliveryId }),
      PackageCreated.create({
        organizationId: orgId,
        packageId: asDeliveryPackageId("pkg1"),
        deliveryId,
        name: "Pack",
      }),
      PackageSealed.create({
        organizationId: orgId,
        packageId: asDeliveryPackageId("pkg1"),
        deliveryId,
      }),
      PackageArchived.create({
        organizationId: orgId,
        packageId: asDeliveryPackageId("pkg1"),
      }),
      ItemAdded.create({
        organizationId: orgId,
        itemId: asDeliveryItemId("i1"),
        packageId: asDeliveryPackageId("pkg1"),
        assetId: "a",
        assetVersionId: "v",
      }),
      ItemRemoved.create({
        organizationId: orgId,
        itemId: asDeliveryItemId("i1"),
        packageId: asDeliveryPackageId("pkg1"),
      }),
      ReceiptCreated.create({
        organizationId: orgId,
        receiptId: asDeliveryReceiptId("rc1"),
        deliveryId,
        recipientId: "c1",
        status: ReceiptStatus.PENDING,
      }),
      ReceiptConfirmed.create({
        organizationId: orgId,
        receiptId: asDeliveryReceiptId("rc1"),
        deliveryId,
      }),
      ReceiptRejected.create({
        organizationId: orgId,
        receiptId: asDeliveryReceiptId("rc1"),
        deliveryId,
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
    }
  });
});
