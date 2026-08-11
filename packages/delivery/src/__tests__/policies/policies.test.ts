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
import {
  DuplicateDeliveryItemError,
  DuplicateReceiptError,
} from "../../errors/DeliveryErrors.js";
import {
  DeliveryLifecyclePolicy,
  ItemPolicy,
  PackagePolicy,
  ReceiptPolicy,
} from "../../policies/index.js";
import { asDeliveryItemId } from "../../types/ids.js";

const orgId = asOrganizationId("org-1");

function delivery() {
  return Delivery.create({
    organizationId: orgId,
    projectId: asProjectId("p1"),
    productionId: asProductionId("pr1"),
    reviewId: asReviewId("r1"),
  });
}

describe("DeliveryLifecyclePolicy", () => {
  it("allows ready from draft", () => {
    const d = delivery();
    expect(() =>
      DeliveryLifecyclePolicy.assertCanTransition(d, DeliveryStatus.READY),
    ).not.toThrow();
  });

  it("blocks confirm before deliver", () => {
    const d = delivery();
    d.markReady();
    expect(() => DeliveryLifecyclePolicy.assertCanConfirm(d)).toThrow();
  });
});

describe("PackagePolicy", () => {
  it("can seal with items", () => {
    const d = delivery();
    const pkg = DeliveryPackage.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "P",
      itemIds: [asDeliveryItemId("i1")],
    });
    expect(() => PackagePolicy.assertCanSeal(pkg)).not.toThrow();
  });
});

describe("ItemPolicy", () => {
  it("unique asset version per package", () => {
    const d = delivery();
    const pkg = DeliveryPackage.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "P",
    });
    const item = DeliveryItem.create({
      organizationId: orgId,
      packageId: pkg.id,
      assetId: asAssetId("a1"),
      assetVersionId: asAssetVersionId("v1"),
      name: "Item",
    });
    expect(() =>
      ItemPolicy.assertUniqueAssetVersion(
        [item],
        pkg.id,
        asAssetVersionId("v1"),
      ),
    ).toThrow(DuplicateDeliveryItemError);
  });
});

describe("ReceiptPolicy", () => {
  it("one receipt per recipient", () => {
    const d = delivery();
    d.markReady();
    d.deliver();
    const r = DeliveryReceipt.create({
      organizationId: orgId,
      deliveryId: d.id,
      recipientId: "client",
    });
    expect(() =>
      ReceiptPolicy.assertOnePerRecipient([r], d.id, "client"),
    ).toThrow(DuplicateReceiptError);
  });

  it("assertPending on confirmed fails", () => {
    const d = delivery();
    d.markReady();
    d.deliver();
    const r = DeliveryReceipt.create({
      organizationId: orgId,
      deliveryId: d.id,
      recipientId: "c2",
    });
    r.confirm();
    expect(() => ReceiptPolicy.assertPending(r)).toThrow();
  });
});

describe("DeliveryLifecyclePolicy deliver", () => {
  it("assertCanDeliver from READY", () => {
    const d = delivery();
    d.markReady();
    expect(() => DeliveryLifecyclePolicy.assertCanDeliver(d)).not.toThrow();
  });

  it("assertMutable on DRAFT", () => {
    const d = delivery();
    expect(() => DeliveryLifecyclePolicy.assertMutable(d)).not.toThrow();
  });
});
