import type { Deliverable } from "../aggregates/Deliverable/Deliverable.js";
import type { DeliverableId, EngagementId } from "../types/ids.js";

export interface DeliverableRepository {
  findById(id: DeliverableId): Promise<Deliverable | null>;
  findByEngagement(engagementId: EngagementId): Promise<Deliverable[]>;
  save(deliverable: Deliverable): Promise<void>;
  update(deliverable: Deliverable): Promise<void>;
  exists(id: DeliverableId): Promise<boolean>;
}
