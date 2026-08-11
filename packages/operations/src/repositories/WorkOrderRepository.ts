import type { AllocationId } from "../types/ids.js";
import type { OrganizationId } from "@creative-lab/organization";
import type { BookingId } from "@creative-lab/scheduling";
import type { WorkOrder } from "../aggregates/WorkOrder/WorkOrder.js";
import type { WorkOrderId } from "../types/ids.js";

export interface WorkOrderRepository {
  findById(id: WorkOrderId): Promise<WorkOrder | null>;
  findByOrganization(organizationId: OrganizationId): Promise<WorkOrder[]>;
  findByAllocation(allocationId: AllocationId): Promise<WorkOrder[]>;
  findByBooking(bookingId: BookingId): Promise<WorkOrder[]>;
  findActive(): Promise<WorkOrder[]>;
  save(workOrder: WorkOrder): Promise<void>;
  update(workOrder: WorkOrder): Promise<void>;
  archive(id: WorkOrderId): Promise<void>;
  exists(id: WorkOrderId): Promise<boolean>;
}
