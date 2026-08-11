import { describe, expect, it } from "vitest";
import { asAssetId, asAssetVersionId } from "@creative-lab/assets";
import { asOrganizationId } from "@creative-lab/organization";
import { asProductionId } from "@creative-lab/production";
import { asProjectId } from "@creative-lab/projects";
import { asReviewId } from "@creative-lab/review";
import { Delivery } from "../../aggregates/Delivery/Delivery.js";
import { DeliveryItem } from "../../aggregates/DeliveryItem/DeliveryItem.js";
import { DeliveryPackage } from "../../aggregates/DeliveryPackage/DeliveryPackage.js";
import { DeliveryReceipt } from "../../aggregates/DeliveryReceipt/DeliveryReceipt.js";
import { DeliveryStatus } from "../../enums/DeliveryStatus.js";
import { PackageStatus } from "../../enums/PackageStatus.js";
import { ReceiptStatus } from "../../enums/ReceiptStatus.js";
import {
  InvalidDeliveryStateError,
  PackageAlreadySealedError,
} from "../../errors/DeliveryErrors.js";
import {
  DeliveryCreated,
  DeliveryDelivered,
  DeliveryReady,
  PackageCreated,
  PackageSealed,
  ReceiptConfirmed,
  ReceiptCreated,
} from "../../events/delivery-events.js";
import { asDeliveryItemId } from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const productionId = asProductionId("prod-1");
const reviewId = asReviewId("rev-1");

function createDelivery(
  overrides: Partial<Parameters<typeof Delivery.create>[0]> = {},
) {
  return Delivery.create({
    organizationId: orgId,
    projectId,
    productionId,
    reviewId,
    ...overrides,
  });
}

describe("Delivery aggregate", () => {
  it("creates DRAFT with reference and event", () => {
    const d = createDelivery({ referenceNumber: "DEL-TEST-001" });
    expect(d.status).toBe(DeliveryStatus.DRAFT);
    expect(d.referenceNumber.value).toBe("DEL-TEST-001");
    expect(d.projectId).toBe(projectId);
    expect(d.pullDomainEvents()[0]).toBeInstanceOf(DeliveryCreated);
  });

  it("lifecycle READY → DELIVERED → CONFIRMED → ARCHIVED", () => {
    const d = createDelivery();
    d.pullDomainEvents();
    d.markReady();
    expect(d.status).toBe(DeliveryStatus.READY);
    expect(d.pullDomainEvents()[0]).toBeInstanceOf(DeliveryReady);
    d.deliver();
    expect(d.status).toBe(DeliveryStatus.DELIVERED);
    expect(d.deliveredAt).not.toBeNull();
    expect(d.pullDomainEvents()[0]).toBeInstanceOf(DeliveryDelivered);
    d.confirm();
    expect(d.status).toBe(DeliveryStatus.CONFIRMED);
    d.archive();
    expect(d.isArchived).toBe(true);
  });

  it("cannot deliver twice", () => {
    const d = createDelivery();
    d.markReady();
    d.deliver();
    expect(() => d.deliver()).toThrow(InvalidDeliveryStateError);
  });

  it("cannot confirm before delivery", () => {
    const d = createDelivery();
    d.markReady();
    expect(() => d.confirm()).toThrow(InvalidDeliveryStateError);
  });

  it("archived is immutable", () => {
    const d = createDelivery();
    d.archive();
    expect(() => d.markReady()).toThrow(InvalidDeliveryStateError);
  });

  it("reconstitutes snapshot", () => {
    const d = createDelivery({ referenceNumber: "DEL-SNAP" });
    const r = Delivery.reconstitute(d.toSnapshot());
    expect(r.referenceNumber.value).toBe("DEL-SNAP");
  });
});

describe("DeliveryPackage aggregate", () => {
  it("creates OPEN and seals with items", () => {
    const d = createDelivery();
    const pkg = DeliveryPackage.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "Masters",
    });
    expect(pkg.status).toBe(PackageStatus.OPEN);
    expect(pkg.pullDomainEvents()[0]).toBeInstanceOf(PackageCreated);
    pkg.addItem(asDeliveryItemId("i1"));
    pkg.seal();
    expect(pkg.isSealed).toBe(true);
    expect(pkg.pullDomainEvents()[0]).toBeInstanceOf(PackageSealed);
  });

  it("cannot seal empty package", () => {
    const d = createDelivery();
    const pkg = DeliveryPackage.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "Empty",
    });
    expect(() => pkg.seal()).toThrow(InvalidDeliveryStateError);
  });

  it("sealed is immutable", () => {
    const d = createDelivery();
    const pkg = DeliveryPackage.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "P",
      itemIds: [asDeliveryItemId("i1")],
    });
    pkg.seal();
    expect(() => pkg.rename("X")).toThrow(PackageAlreadySealedError);
    expect(() => pkg.addItem(asDeliveryItemId("i2"))).toThrow(
      PackageAlreadySealedError,
    );
  });

  it("cannot archive open package", () => {
    const d = createDelivery();
    const pkg = DeliveryPackage.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "P",
    });
    expect(() => pkg.archive()).toThrow(InvalidDeliveryStateError);
  });
});

describe("DeliveryItem aggregate", () => {
  it("stores only references", () => {
    const d = createDelivery();
    const pkg = DeliveryPackage.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "P",
    });
    const item = DeliveryItem.create({
      organizationId: orgId,
      packageId: pkg.id,
      assetId: asAssetId("asset-1"),
      assetVersionId: asAssetVersionId("ver-1"),
      name: "Master v2",
    });
    expect(item.assetId).toBe(asAssetId("asset-1"));
    expect(item.assetVersionId).toBe(asAssetVersionId("ver-1"));
    const snap = item.toSnapshot();
    expect(snap).not.toHaveProperty("url");
    expect(snap).not.toHaveProperty("path");
  });
});

describe("DeliveryReceipt aggregate", () => {
  it("confirm and reject lifecycle", () => {
    const d = createDelivery();
    d.markReady();
    d.deliver();
    const r = DeliveryReceipt.create({
      organizationId: orgId,
      deliveryId: d.id,
      recipientId: "client-1",
    });
    expect(r.status).toBe(ReceiptStatus.PENDING);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(ReceiptCreated);
    r.confirm();
    expect(r.status).toBe(ReceiptStatus.CONFIRMED);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(ReceiptConfirmed);
    expect(() => r.confirm()).toThrow(InvalidDeliveryStateError);
  });

  it("reject is terminal", () => {
    const d = createDelivery();
    d.markReady();
    d.deliver();
    const r = DeliveryReceipt.create({
      organizationId: orgId,
      deliveryId: d.id,
      recipientId: "client-2",
    });
    r.reject();
    expect(r.status).toBe(ReceiptStatus.REJECTED);
    expect(() => r.confirm()).toThrow(InvalidDeliveryStateError);
  });

  it("package reconstitute and contains", () => {
    const d = createDelivery();
    const pkg = DeliveryPackage.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "Snap",
      itemIds: [asDeliveryItemId("i1")],
    });
    const r = DeliveryPackage.reconstitute(pkg.toSnapshot());
    expect(r.contains(asDeliveryItemId("i1"))).toBe(true);
  });

  it("item markRemoved", () => {
    const d = createDelivery();
    const pkg = DeliveryPackage.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "P",
    });
    const item = DeliveryItem.create({
      organizationId: orgId,
      packageId: pkg.id,
      assetId: asAssetId("a"),
      assetVersionId: asAssetVersionId("v"),
      name: "I",
    });
    item.markRemoved();
    expect(item.removed).toBe(true);
    expect(() => item.markRemoved()).toThrow(InvalidDeliveryStateError);
  });
});
