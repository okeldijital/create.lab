export type {
  WorkerId,
  PositionId,
  EmploymentId,
  EmploymentContractId,
  ReportingRelationshipId,
  EventId,
} from "./ids.js";
export {
  asWorkerId,
  asPositionId,
  asEmploymentId,
  asEmploymentContractId,
  asReportingRelationshipId,
  asEventId,
} from "./ids.js";

/** Re-export organization identity brands for convenience within workforce. */
export type {
  OrganizationId,
  DepartmentId,
  TeamId,
} from "@creative-lab/organization";
export {
  asOrganizationId,
  asDepartmentId,
  asTeamId,
} from "@creative-lab/organization";
