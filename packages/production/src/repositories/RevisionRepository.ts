import type { Revision } from "../aggregates/Revision/Revision.js";
import type { ProductionId, RevisionId } from "../types/ids.js";

export interface RevisionRepository {
  findById(id: RevisionId): Promise<Revision | null>;
  findByProduction(productionId: ProductionId): Promise<Revision[]>;
  save(revision: Revision): Promise<void>;
  update(revision: Revision): Promise<void>;
  close(id: RevisionId): Promise<void>;
}
