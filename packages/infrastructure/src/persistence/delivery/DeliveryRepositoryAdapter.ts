import type {
  Delivery,
  DeliveryId,
  DeliveryRepository,
  DeliveryStatus,
} from "@creative-lab/delivery";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import type { ReviewId } from "@creative-lab/review";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { deliveries } from "./schema.js";
import { DeliveryMapper } from "./mappers.js";

export class PostgresDeliveryRepository implements DeliveryRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: DeliveryId): Promise<Delivery | null> {
    const rows = await this.db.select().from(deliveries).where(eq(deliveries.id, id)).limit(1);
    return rows[0] ? DeliveryMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Delivery[]> {
    const rows = await this.db.select().from(deliveries).where(eq(deliveries.organizationId, organizationId));
    return rows.map(DeliveryMapper.fromRow);
  }

  async findByProject(projectId: ProjectId): Promise<Delivery[]> {
    const rows = await this.db.select().from(deliveries).where(eq(deliveries.projectId, projectId));
    return rows.map(DeliveryMapper.fromRow);
  }

  async findByProduction(productionId: ProductionId): Promise<Delivery[]> {
    const rows = await this.db.select().from(deliveries).where(eq(deliveries.productionId, productionId));
    return rows.map(DeliveryMapper.fromRow);
  }

  async findByReview(reviewId: ReviewId): Promise<Delivery[]> {
    const rows = await this.db.select().from(deliveries).where(eq(deliveries.reviewId, reviewId));
    return rows.map(DeliveryMapper.fromRow);
  }

  async findByReference(referenceNumber: string): Promise<Delivery | null> {
    const rows = await this.db
      .select()
      .from(deliveries)
      .where(eq(deliveries.referenceNumber, referenceNumber))
      .limit(1);
    return rows[0] ? DeliveryMapper.fromRow(rows[0]) : null;
  }

  async findByStatus(status: DeliveryStatus): Promise<Delivery[]> {
    const rows = await this.db.select().from(deliveries).where(eq(deliveries.status, status));
    return rows.map(DeliveryMapper.fromRow);
  }

  async save(delivery: Delivery): Promise<void> {
    await this.db.insert(deliveries).values(DeliveryMapper.toRow(delivery));
  }

  async update(delivery: Delivery): Promise<void> {
    await this.db.update(deliveries).set(DeliveryMapper.toRow(delivery)).where(eq(deliveries.id, delivery.id));
  }

  async archive(id: DeliveryId): Promise<void> {
    const delivery = await this.findById(id);
    if (!delivery) return;
    delivery.archive();
    await this.update(delivery);
  }

  async exists(id: DeliveryId): Promise<boolean> {
    const rows = await this.db.select({ id: deliveries.id }).from(deliveries).where(eq(deliveries.id, id)).limit(1);
    return rows.length > 0;
  }
}
