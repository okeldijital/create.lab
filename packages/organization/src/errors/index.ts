export { DomainError } from "@creative-lab/core";
export {
  OrganizationNotFoundError,
  OrganizationArchivedError,
  DuplicateOrganizationSlugError,
  InvalidOrganizationStatusTransitionError,
  OrganizationValidationError,
} from "./OrganizationErrors.js";
export {
  DepartmentNotFoundError,
  DuplicateDepartmentError,
  DepartmentHierarchyError,
  DepartmentValidationError,
} from "./DepartmentErrors.js";
export {
  TeamNotFoundError,
  DuplicateTeamError,
  TeamValidationError,
} from "./TeamErrors.js";
export {
  StudioNotFoundError,
  DuplicateStudioError,
  InvalidStudioCapacityError,
  StudioValidationError,
} from "./StudioErrors.js";
export {
  OrganizationSettingsNotFoundError,
  OrganizationSettingsValidationError,
} from "./SettingsErrors.js";
