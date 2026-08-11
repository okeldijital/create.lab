import type { Obligation } from "../aggregates/Obligation/Obligation.js";
import type { EngagementId, ObligationId } from "../types/ids.js";

export interface ObligationRepository {
  findById(id: ObligationId): Promise<Obligation | null>;
  findByEngagement(engagementId: EngagementId): Promise<Obligation[]>;
  save(obligation: Obligation): Promise<void>;
  update(obligation: Obligation): Promise<void>;
  exists(id: ObligationId): Promise<boolean>;
}
