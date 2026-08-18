import type { OrganizationId } from "@creative-lab/organization";
import type {
  AllocationId,
  WorkOrder,
  WorkOrderId,
  WorkOrderRepository,
} from "@creative-lab/operations";
import type { BookingId } from "@creative-lab/scheduling";
import { eq, inArray } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { workOrders } from "./schema.js";
import { WorkOrderMapper } from "./mappers.js";

export class PostgresWorkOrderRepository implements WorkOrderRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: WorkOrderId): Promise<WorkOrder | null> {
    const rows = await this.db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
    return rows[0] ? WorkOrderMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<WorkOrder[]> {
    const rows = await this.db.select().from(workOrders).where(eq(workOrders.organizationId, organizationId));
    return rows.map(WorkOrderMapper.fromRow);
  }

  async findByAllocation(allocationId: AllocationId): Promise<WorkOrder[]> {
    const rows = await this.db.select().from(workOrders).where(eq(workOrders.allocationId, allocationId));
    return rows.map(WorkOrderMapper.fromRow);
  }

  async findByBooking(bookingId: BookingId): Promise<WorkOrder[]> {
    const rows = await this.db.select().from(workOrders).where(eq(workOrders.bookingId, bookingId));
    return rows.map(WorkOrderMapper.fromRow);
  }

  async findActive(): Promise<WorkOrder[]> {
    const rows = await this.db
      .select()
      .from(workOrders)
      .where(inArray(workOrders.status, ["CREATED", "READY", "IN_PROGRESS", "PAUSED"]));
    return rows.map(WorkOrderMapper.fromRow);
  }

  async save(workOrder: WorkOrder): Promise<void> {
    await this.db.insert(workOrders).values(WorkOrderMapper.toRow(workOrder));
  }

  async update(workOrder: WorkOrder): Promise<void> {
    await this.db.update(workOrders).set(WorkOrderMapper.toRow(workOrder)).where(eq(workOrders.id, workOrder.id));
  }

  async archive(id: WorkOrderId): Promise<void> {
    // WorkOrder has no ARCHIVED status; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(workOrders).where(eq(workOrders.id, id));
  }

  async exists(id: WorkOrderId): Promise<boolean> {
    const rows = await this.db.select({ id: workOrders.id }).from(workOrders).where(eq(workOrders.id, id)).limit(1);
    return rows.length > 0;
  }
}
