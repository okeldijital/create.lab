import { CapacityProfile } from "../aggregates/CapacityProfile/CapacityProfile.js";
import type { CreateCapacityProfileProps } from "../aggregates/CapacityProfile/CapacityProfile.js";
import { Capability } from "../aggregates/Capability/Capability.js";
import type { CreateCapabilityProps } from "../aggregates/Capability/Capability.js";
import { AvailabilityProfile } from "../aggregates/AvailabilityProfile/AvailabilityProfile.js";
import type { CreateAvailabilityProfileProps } from "../aggregates/AvailabilityProfile/AvailabilityProfile.js";
import { WorkingPattern } from "../aggregates/WorkingPattern/WorkingPattern.js";
import type { CreateWorkingPatternProps } from "../aggregates/WorkingPattern/WorkingPattern.js";
import { ResourceCapacity } from "../aggregates/ResourceCapacity/ResourceCapacity.js";
import type { CreateResourceCapacityProps } from "../aggregates/ResourceCapacity/ResourceCapacity.js";

export const CapacityProfileFactory = {
  create: (props: CreateCapacityProfileProps) => CapacityProfile.create(props),
  reconstitute: CapacityProfile.reconstitute.bind(CapacityProfile),
};

export const CapabilityFactory = {
  create: (props: CreateCapabilityProps) => Capability.create(props),
  reconstitute: Capability.reconstitute.bind(Capability),
};

export const AvailabilityProfileFactory = {
  create: (props: CreateAvailabilityProfileProps) =>
    AvailabilityProfile.create(props),
  reconstitute: AvailabilityProfile.reconstitute.bind(AvailabilityProfile),
};

export const WorkingPatternFactory = {
  create: (props: CreateWorkingPatternProps) => WorkingPattern.create(props),
  reconstitute: WorkingPattern.reconstitute.bind(WorkingPattern),
};

export const ResourceCapacityFactory = {
  create: (props: CreateResourceCapacityProps) =>
    ResourceCapacity.create(props),
  reconstitute: ResourceCapacity.reconstitute.bind(ResourceCapacity),
};
