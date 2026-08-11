import { DomainError } from "@creative-lab/core";

export class EngagementNotFoundError extends DomainError {
  readonly code = "ENGAGEMENT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Engagement not found: ${identifier}`);
  }
}

export class DuplicateEngagementNumberError extends DomainError {
  readonly code = "DUPLICATE_ENGAGEMENT_NUMBER";
  constructor(engagementNumber: string, organizationId: string) {
    super(
      `Engagement number "${engagementNumber}" already exists in organization "${organizationId}".`,
    );
  }
}

export class DeliverableNotFoundError extends DomainError {
  readonly code = "DELIVERABLE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Deliverable not found: ${identifier}`);
  }
}

export class MilestoneNotFoundError extends DomainError {
  readonly code = "MILESTONE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Milestone not found: ${identifier}`);
  }
}

export class ObligationNotFoundError extends DomainError {
  readonly code = "OBLIGATION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Obligation not found: ${identifier}`);
  }
}

export class InvalidEngagementStateError extends DomainError {
  readonly code = "INVALID_ENGAGEMENT_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class DeliverableAlreadyAcceptedError extends DomainError {
  readonly code = "DELIVERABLE_ALREADY_ACCEPTED";
  constructor(deliverableId: string) {
    super(`Deliverable "${deliverableId}" is already accepted.`);
  }
}

export class MilestoneSequenceError extends DomainError {
  readonly code = "MILESTONE_SEQUENCE_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class ObligationAlreadyFulfilledError extends DomainError {
  readonly code = "OBLIGATION_ALREADY_FULFILLED";
  constructor(obligationId: string) {
    super(`Obligation "${obligationId}" is already fulfilled or waived.`);
  }
}

export class EngagementValidationError extends DomainError {
  readonly code = "ENGAGEMENT_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
