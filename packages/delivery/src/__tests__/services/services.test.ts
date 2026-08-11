import { describe, expect, it, beforeEach } from "vitest";
import { asAssetId, asAssetVersionId } from "@creative-lab/assets";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asProductionId } from "@creative-lab/production";
import { asProjectId } from "@creative-lab/projects";
import { asReviewId } from "@creative-lab/review";
import { DeliveryStatus } from "../../enums/DeliveryStatus.js";
import { PackageStatus } from "../../enums/PackageStatus.js";
import { ReceiptStatus } from "../../enums/ReceiptStatus.js";
import {
  DuplicateDeliveryItemError,
  DuplicateReceiptError,
  PackageAlreadySealedError,
} from "../../errors/DeliveryErrors.js";
import {
  DeliveryConfirmed,
  DeliveryCreated,
  DeliveryDelivered,
  DeliveryReady,
  ItemAdded,
  PackageCreated,
  PackageSealed,
  ReceiptConfirmed,
  ReceiptCreated,
} from "../../events/delivery-events.js";
import { DeliveryService } from "../../services/DeliveryService.js";
import { ItemService } from "../../services/ItemService.js";
import { PackageService } from "../../services/PackageService.js";
import { ReceiptService } from "../../services/ReceiptService.js";
import {
  InMemoryDeliveryItemRepository,
  InMemoryDeliveryPackageRepository,
  InMemoryDeliveryReceiptRepository,
  InMemoryDeliveryRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const productionId = asProductionId("prod-1");
const reviewId = asReviewId("rev-1");

describe("Delivery services", () => {
  let orgs: InMemoryOrganizationRepository;
  let deliveries: InMemoryDeliveryRepository;
  let packages: InMemoryDeliveryPackageRepository;
  let items: InMemoryDeliveryItemRepository;
  let receipts: InMemoryDeliveryReceiptRepository;
  let events: InMemoryEventPublisher;
  let deliveryService: DeliveryService;
  let packageService: PackageService;
  let itemService: ItemService;
  let receiptService: ReceiptService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    deliveries = new InMemoryDeliveryRepository();
    packages = new InMemoryDeliveryPackageRepository();
    items = new InMemoryDeliveryItemRepository();
    receipts = new InMemoryDeliveryReceiptRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    deliveryService = new DeliveryService({
      deliveryRepository: deliveries,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    packageService = new PackageService({
      deliveryPackageRepository: packages,
      deliveryRepository: deliveries,
      eventPublisher: events,
    });
    itemService = new ItemService({
      deliveryItemRepository: items,
      deliveryPackageRepository: packages,
      eventPublisher: events,
    });
    receiptService = new ReceiptService({
      deliveryReceiptRepository: receipts,
      deliveryRepository: deliveries,
      eventPublisher: events,
    });
  });

  async function createDraft() {
    return deliveryService.create({
      organizationId: orgId,
      projectId,
      productionId,
      reviewId,
    });
  }

  it("creates delivery with generated reference", async () => {
    const d = await createDraft();
    expect(d.referenceNumber.value.startsWith("DEL-")).toBe(true);
    expect(events.events.some((e) => e instanceof DeliveryCreated)).toBe(true);
  });

  it("full delivery lifecycle", async () => {
    const d = await createDraft();
    await deliveryService.markReady(d.id);
    expect(events.events.some((e) => e instanceof DeliveryReady)).toBe(true);
    await deliveryService.deliver(d.id);
    expect(events.events.some((e) => e instanceof DeliveryDelivered)).toBe(
      true,
    );
    await deliveryService.confirm(d.id);
    expect(events.events.some((e) => e instanceof DeliveryConfirmed)).toBe(
      true,
    );
    expect((await deliveryService.getById(d.id)).status).toBe(
      DeliveryStatus.CONFIRMED,
    );
    await deliveryService.archive(d.id);
    expect((await deliveryService.getById(d.id)).isArchived).toBe(true);
  });

  it("package seal and item management", async () => {
    const d = await createDraft();
    const pkg = await packageService.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "Final Masters",
    });
    expect(events.events.some((e) => e instanceof PackageCreated)).toBe(true);
    expect((await deliveryService.getById(d.id)).packageId).toBe(pkg.id);

    const item = await itemService.create({
      organizationId: orgId,
      packageId: pkg.id,
      assetId: asAssetId("asset-1"),
      assetVersionId: asAssetVersionId("ver-1"),
      name: "Master WAV",
    });
    expect(events.events.some((e) => e instanceof ItemAdded)).toBe(true);

    await expect(
      itemService.create({
        organizationId: orgId,
        packageId: pkg.id,
        assetId: asAssetId("asset-1"),
        assetVersionId: asAssetVersionId("ver-1"),
        name: "Dup",
      }),
    ).rejects.toThrow(DuplicateDeliveryItemError);

    await packageService.seal(pkg.id);
    expect(events.events.some((e) => e instanceof PackageSealed)).toBe(true);
    expect((await packageService.getById(pkg.id)).status).toBe(
      PackageStatus.SEALED,
    );
    await expect(packageService.rename(pkg.id, "X")).rejects.toThrow(
      PackageAlreadySealedError,
    );
    await expect(
      itemService.create({
        organizationId: orgId,
        packageId: pkg.id,
        assetId: asAssetId("a2"),
        assetVersionId: asAssetVersionId("v2"),
        name: "Late",
      }),
    ).rejects.toThrow(PackageAlreadySealedError);

    void item;
  });

  it("remove item before seal", async () => {
    const d = await createDraft();
    const pkg = await packageService.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "Pack",
    });
    const item = await itemService.create({
      organizationId: orgId,
      packageId: pkg.id,
      assetId: asAssetId("a1"),
      assetVersionId: asAssetVersionId("v1"),
      name: "Item",
    });
    await itemService.remove(item.id);
    expect((await packageService.getById(pkg.id)).contains(item.id)).toBe(
      false,
    );
  });

  it("receipt lifecycle and duplicates", async () => {
    const d = await createDraft();
    await deliveryService.markReady(d.id);
    await deliveryService.deliver(d.id);

    const receipt = await receiptService.create({
      organizationId: orgId,
      deliveryId: d.id,
      recipientId: "client-1",
    });
    expect(events.events.some((e) => e instanceof ReceiptCreated)).toBe(true);

    await expect(
      receiptService.create({
        organizationId: orgId,
        deliveryId: d.id,
        recipientId: "client-1",
      }),
    ).rejects.toThrow(DuplicateReceiptError);

    await receiptService.confirm(receipt.id);
    expect(events.events.some((e) => e instanceof ReceiptConfirmed)).toBe(true);
    expect((await receiptService.getById(receipt.id)).status).toBe(
      ReceiptStatus.CONFIRMED,
    );
  });

  it("reject receipt", async () => {
    const d = await createDraft();
    await deliveryService.markReady(d.id);
    await deliveryService.deliver(d.id);
    const receipt = await receiptService.create({
      organizationId: orgId,
      deliveryId: d.id,
      recipientId: "client-2",
    });
    await receiptService.reject(receipt.id);
    expect((await receiptService.getById(receipt.id)).status).toBe(
      ReceiptStatus.REJECTED,
    );
  });

  it("lists by project production review", async () => {
    await createDraft();
    expect((await deliveryService.listByProject(projectId)).length).toBe(1);
    expect((await deliveryService.listByProduction(productionId)).length).toBe(
      1,
    );
    expect((await deliveryService.listByReview(reviewId)).length).toBe(1);
  });

  it("findByReference", async () => {
    const d = await deliveryService.create({
      organizationId: orgId,
      projectId,
      productionId,
      reviewId,
      referenceNumber: "DEL-UNIQUE-99",
    });
    const found = await deliveryService.findByReference("DEL-UNIQUE-99");
    expect(found?.id).toBe(d.id);
  });

  it("package rename before seal", async () => {
    const d = await createDraft();
    const pkg = await packageService.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "Old",
    });
    await packageService.rename(pkg.id, "New Name");
    expect((await packageService.getById(pkg.id)).name.value).toBe("New Name");
  });

  it("archive sealed package", async () => {
    const d = await createDraft();
    const pkg = await packageService.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "P",
    });
    await itemService.create({
      organizationId: orgId,
      packageId: pkg.id,
      assetId: asAssetId("a9"),
      assetVersionId: asAssetVersionId("v9"),
      name: "I",
    });
    await packageService.seal(pkg.id);
    await packageService.archive(pkg.id);
    expect((await packageService.getById(pkg.id)).isArchived).toBe(true);
  });

  it("lists packages and items and receipts", async () => {
    const d = await createDraft();
    const pkg = await packageService.create({
      organizationId: orgId,
      deliveryId: d.id,
      name: "List Pack",
    });
    await itemService.create({
      organizationId: orgId,
      packageId: pkg.id,
      assetId: asAssetId("al"),
      assetVersionId: asAssetVersionId("vl"),
      name: "LI",
    });
    await deliveryService.markReady(d.id);
    await deliveryService.deliver(d.id);
    await receiptService.create({
      organizationId: orgId,
      deliveryId: d.id,
      recipientId: "list-client",
    });
    expect((await packageService.listByDelivery(d.id)).length).toBe(1);
    expect((await itemService.listByPackage(pkg.id)).length).toBe(1);
    expect((await receiptService.listByDelivery(d.id)).length).toBe(1);
  });

  it("receipts require delivered status", async () => {
    const d = await createDraft();
    await expect(
      receiptService.create({
        organizationId: orgId,
        deliveryId: d.id,
        recipientId: "early",
      }),
    ).rejects.toThrow();
  });
});
