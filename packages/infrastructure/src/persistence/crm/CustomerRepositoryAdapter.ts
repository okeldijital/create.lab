import type { CustomerRepository, Customer, CustomerId } from "@creative-lab/crm";
import { CustomerStatus } from "@creative-lab/crm";
import type { OrganizationId } from "@creative-lab/organization";
import { eq, and } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { customers } from "./schema.js";
import { CustomerMapper } from "./mappers.js";

export class PostgresCustomerRepository implements CustomerRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: CustomerId): Promise<Customer | null> {
    const rows = await this.db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return rows[0] ? CustomerMapper.fromRow(rows[0]) : null;
  }
  async findByOrganization(organizationId: OrganizationId): Promise<Customer[]> {
    const rows = await this.db.select().from(customers).where(eq(customers.organizationId, organizationId));
    return rows.map(CustomerMapper.fromRow);
  }
  async findByStatus(status: CustomerStatus): Promise<Customer[]> {
    const rows = await this.db.select().from(customers).where(eq(customers.status, status));
    return rows.map(CustomerMapper.fromRow);
  }
  async findByCustomerNumber(organizationId: OrganizationId, customerNumber: string): Promise<Customer | null> {
    const rows = await this.db.select().from(customers).where(and(eq(customers.organizationId, organizationId), eq(customers.customerNumber, customerNumber))).limit(1);
    return rows[0] ? CustomerMapper.fromRow(rows[0]) : null;
  }
  async save(customer: Customer): Promise<void> { await this.db.insert(customers).values(CustomerMapper.toRow(customer)); }
  async update(customer: Customer): Promise<void> { const row = CustomerMapper.toRow(customer); await this.db.update(customers).set(row).where(eq(customers.id, customer.id)); }
  async archive(id: CustomerId): Promise<void> { const now = new Date(); await this.db.update(customers).set({ status: CustomerStatus.ARCHIVED, archivedAt: now, updatedAt: now }).where(eq(customers.id, id)); }
  async exists(id: CustomerId): Promise<boolean> { const rows = await this.db.select({ id: customers.id }).from(customers).where(eq(customers.id, id)).limit(1); return rows.length > 0; }
}
