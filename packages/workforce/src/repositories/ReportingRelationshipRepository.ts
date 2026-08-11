import type { OrganizationId } from "@creative-lab/organization";
import type { ReportingRelationship } from "../aggregates/ReportingRelationship/ReportingRelationship.js";
import type { ReportingRelationshipId, WorkerId } from "../types/ids.js";

export interface ReportingRelationshipRepository {
  findById(id: ReportingRelationshipId): Promise<ReportingRelationship | null>;
  findAll(): Promise<ReportingRelationship[]>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ReportingRelationship[]>;
  findActiveByWorker(
    workerId: WorkerId,
  ): Promise<ReportingRelationship | null>;
  findActiveByManager(managerId: WorkerId): Promise<ReportingRelationship[]>;
  save(relationship: ReportingRelationship): Promise<void>;
  update(relationship: ReportingRelationship): Promise<void>;
  archive(id: ReportingRelationshipId): Promise<void>;
  exists(id: ReportingRelationshipId): Promise<boolean>;
  delete(id: ReportingRelationshipId): Promise<void>;
}
