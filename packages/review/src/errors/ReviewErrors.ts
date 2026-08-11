import { DomainError } from "@creative-lab/core";

export class ReviewNotFoundError extends DomainError {
  readonly code = "REVIEW_NOT_FOUND";
  constructor(identifier: string) {
    super(`Review not found: ${identifier}`);
  }
}

export class ApprovalNotFoundError extends DomainError {
  readonly code = "APPROVAL_NOT_FOUND";
  constructor(identifier: string) {
    super(`Approval not found: ${identifier}`);
  }
}

export class SessionNotFoundError extends DomainError {
  readonly code = "SESSION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Review session not found: ${identifier}`);
  }
}

export class DecisionNotFoundError extends DomainError {
  readonly code = "DECISION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Review decision not found: ${identifier}`);
  }
}

export class ReviewAlreadyApprovedError extends DomainError {
  readonly code = "REVIEW_ALREADY_APPROVED";
  constructor(reviewId: string) {
    super(`Review "${reviewId}" is already approved.`);
  }
}

export class ApprovalAlreadyCompletedError extends DomainError {
  readonly code = "APPROVAL_ALREADY_COMPLETED";
  constructor(approvalId: string) {
    super(`Approval "${approvalId}" is already completed.`);
  }
}

export class InvalidReviewStateError extends DomainError {
  readonly code = "INVALID_REVIEW_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateDecisionError extends DomainError {
  readonly code = "DUPLICATE_DECISION";
  constructor(reviewerId: string, approvalId: string) {
    super(
      `Reviewer "${reviewerId}" already recorded a decision on approval "${approvalId}".`,
    );
  }
}

export class ReviewValidationError extends DomainError {
  readonly code = "REVIEW_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}

export class SessionAlreadyActiveError extends DomainError {
  readonly code = "SESSION_ALREADY_ACTIVE";
  constructor(reviewId: string) {
    super(`Review "${reviewId}" already has an active session.`);
  }
}
