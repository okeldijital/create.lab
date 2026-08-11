export type {
  CapacityProfileId,
  CapabilityId,
  AvailabilityProfileId,
  WorkingPatternId,
  ResourceCapacityId,
  ResourceId,
} from "./ids.js";
export {
  asCapacityProfileId,
  asCapabilityId,
  asAvailabilityProfileId,
  asWorkingPatternId,
  asResourceCapacityId,
  asResourceId,
} from "./ids.js";

export type { OrganizationId } from "@creative-lab/organization";
export { asOrganizationId } from "@creative-lab/organization";

export type EffectivePeriod = {
  effectiveFrom: Date;
  effectiveTo: Date | null;
};
