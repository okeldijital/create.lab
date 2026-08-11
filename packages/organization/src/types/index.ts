export type {
  OrganizationId,
  DepartmentId,
  TeamId,
  StudioId,
  EventId,
} from "./ids.js";
export {
  asOrganizationId,
  asDepartmentId,
  asTeamId,
  asStudioId,
  asEventId,
} from "./ids.js";

export type BrandingMetadata = Readonly<{
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}>;

export type PoliciesMetadata = Readonly<{
  requireDepartmentForTeams?: boolean;
  allowNestedDepartments?: boolean;
  maxDepartmentDepth?: number;
}>;
