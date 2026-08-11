import type { Opportunity } from "../aggregates/Opportunity/Opportunity.js";
import type { OpportunityStatus } from "../enums/OpportunityStatus.js";
import type { CustomerId, OpportunityId } from "../types/ids.js";

export interface OpportunityRepository {
  findById(id: OpportunityId): Promise<Opportunity | null>;
  findByCustomer(customerId: CustomerId): Promise<Opportunity[]>;
  findByStatus(status: OpportunityStatus): Promise<Opportunity[]>;
  save(opportunity: Opportunity): Promise<void>;
  update(opportunity: Opportunity): Promise<void>;
  archive(id: OpportunityId): Promise<void>;
  exists(id: OpportunityId): Promise<boolean>;
}
