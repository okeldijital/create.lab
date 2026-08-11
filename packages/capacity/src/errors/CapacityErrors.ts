import { DomainError } from "@creative-lab/core";

export class CapacityProfileNotFoundError extends DomainError {
  readonly code = "CAPACITY_PROFILE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Capacity profile not found: ${identifier}`);
  }
}

export class CapacityProfileValidationError extends DomainError {
  readonly code = "CAPACITY_PROFILE_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}

export class OverlappingCapacityProfileError extends DomainError {
  readonly code = "OVERLAPPING_CAPACITY_PROFILE";
  constructor(resourceId: string) {
    super(
      `Active capacity profile effective dates overlap for resource "${resourceId}".`,
    );
  }
}

export class DuplicateCapabilityError extends DomainError {
  readonly code = "DUPLICATE_CAPABILITY";
  constructor(name: string, capacityProfileId: string) {
    super(
      `Capability "${name}" already exists on capacity profile "${capacityProfileId}".`,
    );
  }
}

export class CapabilityNotFoundError extends DomainError {
  readonly code = "CAPABILITY_NOT_FOUND";
  constructor(identifier: string) {
    super(`Capability not found: ${identifier}`);
  }
}

export class InvalidCapacityQuantityError extends DomainError {
  readonly code = "INVALID_CAPACITY_QUANTITY";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidWorkingPatternError extends DomainError {
  readonly code = "INVALID_WORKING_PATTERN";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidAvailabilityProfileError extends DomainError {
  readonly code = "INVALID_AVAILABILITY_PROFILE";
  constructor(message: string) {
    super(message);
  }
}

export class ResourceCapacityConflictError extends DomainError {
  readonly code = "RESOURCE_CAPACITY_CONFLICT";
  constructor(message: string) {
    super(message);
  }
}

export class ResourceCapacityNotFoundError extends DomainError {
  readonly code = "RESOURCE_CAPACITY_NOT_FOUND";
  constructor(identifier: string) {
    super(`Resource capacity not found: ${identifier}`);
  }
}

export class AvailabilityProfileNotFoundError extends DomainError {
  readonly code = "AVAILABILITY_PROFILE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Availability profile not found: ${identifier}`);
  }
}

export class WorkingPatternNotFoundError extends DomainError {
  readonly code = "WORKING_PATTERN_NOT_FOUND";
  constructor(identifier: string) {
    super(`Working pattern not found: ${identifier}`);
  }
}
