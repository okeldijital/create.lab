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
  InMemoryDeliveryItemRepository,
  InMemoryDeliveryPackageRepository,
  InMemoryDeliveryReceiptRepository,
  InMemoryDeliveryRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const productionId = asProductionId("prod-1");
const reviewId = asReviewId("rev-1");

describe("Repository contracts", () => {
  it("DeliveryRepository ports", async () => {
    const repo = new InMemoryDeliveryRepository();
    const d = Delivery.create({
      organizationId: orgId,
      projectId,
      productionId,
      reviewId,
      referenceNumber: "DEL-REPO-1",
    });
    await repo.save(d);
    expect(await repo.exists(d.id)).toBe(true);
    expect((await repo.findByProject(projectId))[0]?.id).toBe(d.id);
    expect((await repo.findByProduction(productionId))[0]?.id).toBe(d.id);
    expect((await repo.findByReview(reviewId))[0]?.id).toBe(d.id);
    expect((await repo.findByReference("DEL-REPO-1"))?.id).toBe(d.id);
    expect((await repo.findByStatus(DeliveryStatus.DRAFT)).length).toBe(1);
  });

  it("Package Item Receipt ports", async () => {
    const d = Delivery.create({
      organizationId: orgId,
      projectId,
      productionId,
      reviewId,
    });
    const pRepo = new InMemoryDeliveryPackageRepository();
    const pkg = DeliveryPackage.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "P",
    });
    await pRepo.save(pkg);
    expect((await pRepo.findByDelivery(d.id)).length).toBe(1);

    const iRepo = new InMemoryDeliveryItemRepository();
    await iRepo.save(
      DeliveryItem.create({
        organizationId: orgId,
        packageId: pkg.id,
        assetId: asAssetId("a"),
        assetVersionId: asAssetVersionId("v"),
        name: "I",
      }),
    );
    expect((await iRepo.findByPackage(pkg.id)).length).toBe(1);

    d.markReady();
    d.deliver();
    const rRepo = new InMemoryDeliveryReceiptRepository();
    const receipt = DeliveryReceipt.create({
      organizationId: orgId,
      deliveryId: d.id,
      recipientId: "c1",
    });
    await rRepo.save(receipt);
    expect((await rRepo.findByDelivery(d.id)).length).toBe(1);
    expect(
      (await rRepo.findByRecipient(d.id, "c1"))?.id,
    ).toBe(receipt.id);
  });
});
