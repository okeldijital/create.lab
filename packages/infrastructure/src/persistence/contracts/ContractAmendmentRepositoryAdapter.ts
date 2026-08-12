import type { ContractAmendment, ContractAmendmentId, ContractAmendmentRepository, ContractId } from "@creative-lab/contracts";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { contractAmendments } from "./schema.js";
import { ContractAmendmentMapper } from "./mappers.js";

export class PostgresContractAmendmentRepository implements ContractAmendmentRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ContractAmendmentId): Promise<ContractAmendment | null> {
    const rows = await this.db.select().from(contractAmendments).where(eq(contractAmendments.id, id)).limit(1);
    return rows[0] ? ContractAmendmentMapper.fromRow(rows[0]) : null;
  }

  async findByContract(contractId: ContractId): Promise<ContractAmendment[]> {
    const rows = await this.db.select().from(contractAmendments).where(eq(contractAmendments.contractId, contractId));
    return rows.map(ContractAmendmentMapper.fromRow);
  }

  async save(amendment: ContractAmendment): Promise<void> {
    await this.db.insert(contractAmendments).values(ContractAmendmentMapper.toRow(amendment));
  }

  async update(amendment: ContractAmendment): Promise<void> {
    await this.db.update(contractAmendments).set(ContractAmendmentMapper.toRow(amendment)).where(eq(contractAmendments.id, amendment.id));
  }

  async exists(id: ContractAmendmentId): Promise<boolean> {
    const rows = await this.db.select({ id: contractAmendments.id }).from(contractAmendments).where(eq(contractAmendments.id, id)).limit(1);
    return rows.length > 0;
  }
}
