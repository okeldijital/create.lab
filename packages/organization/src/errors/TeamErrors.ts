import { DomainError } from "@creative-lab/core";

export class TeamNotFoundError extends DomainError {
  readonly code = "TEAM_NOT_FOUND";

  constructor(identifier: string) {
    super(`Team not found: ${identifier}`);
  }
}

export class DuplicateTeamError extends DomainError {
  readonly code = "DUPLICATE_TEAM";

  constructor(name: string, departmentId: string) {
    super(
      `Team name "${name}" already exists in department "${departmentId}".`,
    );
  }
}

export class TeamValidationError extends DomainError {
  readonly code = "TEAM_VALIDATION";

  constructor(message: string) {
    super(message);
  }
}
