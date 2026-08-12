import type { ContractId, ContractVersion, ContractVersionId, ContractVersionRepository } from "@creative-lab/contracts";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { contractVersions } from "./schema.js";
import { ContractVersionMapper } from "./mappers.js";

export class PostgresContractVersionRepository implements ContractVersionRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ContractVersionId): Promise<ContractVersion | null> {
    const rows = await this.db.select().from(contractVersions).where(eq(contractVersions.id, id)).limit(1);
    return rows[0] ? ContractVersionMapper.fromRow(rows[0]) : null;
  }

  async findByContract(contractId: ContractId): Promise<ContractVersion[]> {
    const rows = await this.db.select().from(contractVersions).where(eq(contractVersions.contractId, contractId));
    return rows.map(ContractVersionMapper.fromRow);
  }

  async findCurrentVersion(contractId: ContractId): Promise<ContractVersion | null> {
    const rows = await this.db.select().from(contractVersions).where(and(eq(contractVersions.contractId, contractId), eq(contractVersions.status, "CURRENT"))).limit(1);
    return rows[0] ? ContractVersionMapper.fromRow(rows[0]) : null;
  }

  async save(version: ContractVersion): Promise<void> {
    await this.db.insert(contractVersions).values(ContractVersionMapper.toRow(version));
  }

  async update(version: ContractVersion): Promise<void> {
    await this.db.update(contractVersions).set(ContractVersionMapper.toRow(version)).where(eq(contractVersions.id, version.id));
  }

  async exists(id: ContractVersionId): Promise<boolean> {
    const rows = await this.db.select({ id: contractVersions.id }).from(contractVersions).where(eq(contractVersions.id, id)).limit(1);
    return rows.length > 0;
  }
}
