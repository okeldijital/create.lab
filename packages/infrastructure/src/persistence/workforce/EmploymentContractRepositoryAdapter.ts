import type { OrganizationId } from "@creative-lab/organization";
import type { EmploymentContract, EmploymentContractId, EmploymentContractRepository, EmploymentId } from "@creative-lab/workforce";
import { ContractStatus } from "@creative-lab/workforce";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { employmentContracts } from "./schema.js";
import { EmploymentContractMapper } from "./mappers.js";

export class PostgresEmploymentContractRepository implements EmploymentContractRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: EmploymentContractId): Promise<EmploymentContract | null> {
    const rows = await this.db.select().from(employmentContracts).where(eq(employmentContracts.id, id)).limit(1);
    return rows[0] ? EmploymentContractMapper.fromRow(rows[0]) : null;
  }
  async findAll(): Promise<EmploymentContract[]> {
    const rows = await this.db.select().from(employmentContracts);
    return rows.map(EmploymentContractMapper.fromRow);
  }
  async findByOrganization(organizationId: OrganizationId): Promise<EmploymentContract[]> {
    const rows = await this.db.select().from(employmentContracts).where(eq(employmentContracts.organizationId, organizationId));
    return rows.map(EmploymentContractMapper.fromRow);
  }
  async findByEmployment(employmentId: EmploymentId): Promise<EmploymentContract[]> {
    const rows = await this.db.select().from(employmentContracts).where(eq(employmentContracts.employmentId, employmentId));
    return rows.map(EmploymentContractMapper.fromRow);
  }
  async findActiveByEmployment(employmentId: EmploymentId): Promise<EmploymentContract | null> {
    const rows = await this.db.select().from(employmentContracts).where(and(eq(employmentContracts.employmentId, employmentId), eq(employmentContracts.status, ContractStatus.ACTIVE))).limit(1);
    return rows[0] ? EmploymentContractMapper.fromRow(rows[0]) : null;
  }
  async save(contract: EmploymentContract): Promise<void> {
    await this.db.insert(employmentContracts).values(EmploymentContractMapper.toRow(contract));
  }
  async update(contract: EmploymentContract): Promise<void> {
    await this.db.update(employmentContracts).set(EmploymentContractMapper.toRow(contract)).where(eq(employmentContracts.id, contract.id));
  }
  async archive(id: EmploymentContractId): Promise<void> {
    await this.db.delete(employmentContracts).where(eq(employmentContracts.id, id));
  }
  async exists(id: EmploymentContractId): Promise<boolean> {
    const rows = await this.db.select({ id: employmentContracts.id }).from(employmentContracts).where(eq(employmentContracts.id, id)).limit(1);
    return rows.length > 0;
  }
  async delete(id: EmploymentContractId): Promise<void> {
    await this.db.delete(employmentContracts).where(eq(employmentContracts.id, id));
  }
}
