import type { ContractTerm, ContractTermId, ContractTermRepository, ContractVersionId } from "@creative-lab/contracts";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { contractTerms } from "./schema.js";
import { ContractTermMapper } from "./mappers.js";

export class PostgresContractTermRepository implements ContractTermRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ContractTermId): Promise<ContractTerm | null> {
    const rows = await this.db.select().from(contractTerms).where(eq(contractTerms.id, id)).limit(1);
    return rows[0] ? ContractTermMapper.fromRow(rows[0]) : null;
  }

  async findByVersion(versionId: ContractVersionId): Promise<ContractTerm[]> {
    const rows = await this.db.select().from(contractTerms).where(eq(contractTerms.contractVersionId, versionId));
    return rows.map(ContractTermMapper.fromRow);
  }

  async save(term: ContractTerm): Promise<void> {
    await this.db.insert(contractTerms).values(ContractTermMapper.toRow(term));
  }

  async update(term: ContractTerm): Promise<void> {
    await this.db.update(contractTerms).set(ContractTermMapper.toRow(term)).where(eq(contractTerms.id, term.id));
  }

  async delete(id: ContractTermId): Promise<void> {
    await this.db.delete(contractTerms).where(eq(contractTerms.id, id));
  }

  async exists(id: ContractTermId): Promise<boolean> {
    const rows = await this.db.select({ id: contractTerms.id }).from(contractTerms).where(eq(contractTerms.id, id)).limit(1);
    return rows.length > 0;
  }
}
