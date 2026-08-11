import { DomainError } from "@creative-lab/core";

export class ContractNotFoundError extends DomainError {
  readonly code = "CONTRACT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Contract not found: ${identifier}`);
  }
}

export class DuplicateContractNumberError extends DomainError {
  readonly code = "DUPLICATE_CONTRACT_NUMBER";
  constructor(contractNumber: string, organizationId: string) {
    super(
      `Contract number "${contractNumber}" already exists in organization "${organizationId}".`,
    );
  }
}

export class ContractVersionNotFoundError extends DomainError {
  readonly code = "CONTRACT_VERSION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Contract version not found: ${identifier}`);
  }
}

export class ContractAlreadyActiveError extends DomainError {
  readonly code = "CONTRACT_ALREADY_ACTIVE";
  constructor(contractId: string) {
    super(`Contract "${contractId}" is already active.`);
  }
}

export class ContractExpiredError extends DomainError {
  readonly code = "CONTRACT_EXPIRED";
  constructor(contractId: string) {
    super(`Contract "${contractId}" has expired.`);
  }
}

export class ContractTermError extends DomainError {
  readonly code = "CONTRACT_TERM_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class MandatoryTermRemovalError extends DomainError {
  readonly code = "MANDATORY_TERM_REMOVAL";
  constructor(termId: string) {
    super(`Cannot remove mandatory term "${termId}".`);
  }
}

export class ContractAmendmentError extends DomainError {
  readonly code = "CONTRACT_AMENDMENT_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidContractStateError extends DomainError {
  readonly code = "INVALID_CONTRACT_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class ContractValidationError extends DomainError {
  readonly code = "CONTRACT_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}

export class ContractTermNotFoundError extends DomainError {
  readonly code = "CONTRACT_TERM_NOT_FOUND";
  constructor(identifier: string) {
    super(`Contract term not found: ${identifier}`);
  }
}

export class ContractAmendmentNotFoundError extends DomainError {
  readonly code = "CONTRACT_AMENDMENT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Contract amendment not found: ${identifier}`);
  }
}
