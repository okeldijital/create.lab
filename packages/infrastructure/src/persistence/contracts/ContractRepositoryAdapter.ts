import type { CustomerId } from "@creative-lab/crm";
import type { OrganizationId } from "@creative-lab/organization";
import type { QuoteId } from "@creative-lab/quotation";
import type { Contract, ContractRepository, ContractStatus, ContractId } from "@creative-lab/contracts";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { contracts } from "./schema.js";
import { ContractMapper } from "./mappers.js";

export class PostgresContractRepository implements ContractRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ContractId): Promise<Contract | null> {
    const rows = await this.db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
    return rows[0] ? ContractMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Contract[]> {
    const rows = await this.db.select().from(contracts).where(eq(contracts.organizationId, organizationId));
    return rows.map(ContractMapper.fromRow);
  }

  async findByCustomer(customerId: CustomerId): Promise<Contract[]> {
    const rows = await this.db.select().from(contracts).where(eq(contracts.customerId, customerId));
    return rows.map(ContractMapper.fromRow);
  }

  async findByQuotation(quotationId: QuoteId): Promise<Contract[]> {
    const rows = await this.db.select().from(contracts).where(eq(contracts.quotationId, quotationId));
    return rows.map(ContractMapper.fromRow);
  }

  async findByStatus(status: ContractStatus): Promise<Contract[]> {
    const rows = await this.db.select().from(contracts).where(eq(contracts.status, status));
    return rows.map(ContractMapper.fromRow);
  }

  async findByContractNumber(organizationId: OrganizationId, contractNumber: string): Promise<Contract | null> {
    const rows = await this.db.select().from(contracts).where(and(eq(contracts.organizationId, organizationId), eq(contracts.contractNumber, contractNumber))).limit(1);
    return rows[0] ? ContractMapper.fromRow(rows[0]) : null;
  }

  async save(contract: Contract): Promise<void> {
    await this.db.insert(contracts).values(ContractMapper.toRow(contract));
  }

  async update(contract: Contract): Promise<void> {
    await this.db.update(contracts).set(ContractMapper.toRow(contract)).where(eq(contracts.id, contract.id));
  }

  async archive(id: ContractId): Promise<void> {
    const now = new Date();
    await this.db.update(contracts).set({ status: "ARCHIVED", archivedAt: now, updatedAt: now }).where(eq(contracts.id, id));
  }

  async exists(id: ContractId): Promise<boolean> {
    const rows = await this.db.select({ id: contracts.id }).from(contracts).where(eq(contracts.id, id)).limit(1);
    return rows.length > 0;
  }
}
