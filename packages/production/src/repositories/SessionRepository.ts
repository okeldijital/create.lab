import type { ProductionSession } from "../aggregates/ProductionSession/ProductionSession.js";
import type { ProductionId, ProductionSessionId } from "../types/ids.js";

export interface SessionRepository {
  findById(id: ProductionSessionId): Promise<ProductionSession | null>;
  findByProduction(productionId: ProductionId): Promise<ProductionSession[]>;
  findOpen(productionId: ProductionId): Promise<ProductionSession | null>;
  save(session: ProductionSession): Promise<void>;
  update(session: ProductionSession): Promise<void>;
}
