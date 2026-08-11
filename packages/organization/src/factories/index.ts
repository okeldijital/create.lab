/**
 * Factory façade for aggregate creation.
 * Prefer aggregate static factories; these re-exports stabilize the public API.
 */

export { Organization } from "../aggregates/Organization/index.js";
export { Department } from "../aggregates/Department/index.js";
export { Team } from "../aggregates/Team/index.js";
export { Studio } from "../aggregates/Studio/index.js";
export { OrganizationSettings } from "../aggregates/OrganizationSettings/index.js";

import { Organization } from "../aggregates/Organization/Organization.js";
import type { CreateOrganizationProps } from "../aggregates/Organization/Organization.js";
import { Department } from "../aggregates/Department/Department.js";
import type { CreateDepartmentProps } from "../aggregates/Department/Department.js";
import { Team } from "../aggregates/Team/Team.js";
import type { CreateTeamProps } from "../aggregates/Team/Team.js";
import { Studio } from "../aggregates/Studio/Studio.js";
import type { CreateStudioProps } from "../aggregates/Studio/Studio.js";
import { OrganizationSettings } from "../aggregates/OrganizationSettings/OrganizationSettings.js";
import type { CreateOrganizationSettingsProps } from "../aggregates/OrganizationSettings/OrganizationSettings.js";

export const OrganizationFactory = {
  create: (props: CreateOrganizationProps) => Organization.create(props),
  reconstitute: Organization.reconstitute.bind(Organization),
};

export const DepartmentFactory = {
  create: (props: CreateDepartmentProps) => Department.create(props),
  reconstitute: Department.reconstitute.bind(Department),
};

export const TeamFactory = {
  create: (props: CreateTeamProps) => Team.create(props),
  reconstitute: Team.reconstitute.bind(Team),
};

export const StudioFactory = {
  create: (props: CreateStudioProps) => Studio.create(props),
  reconstitute: Studio.reconstitute.bind(Studio),
};

export const OrganizationSettingsFactory = {
  create: (props: CreateOrganizationSettingsProps) =>
    OrganizationSettings.create(props),
  defaultsFor: OrganizationSettings.defaultsFor.bind(OrganizationSettings),
  reconstitute: OrganizationSettings.reconstitute.bind(OrganizationSettings),
};
