import type { Command } from "../commands/Command.js";
import { ValidationError } from "../errors/ApplicationErrors.js";

export type FieldError = { field: string; message: string };

/**
 * Validates command shape before handler execution.
 * Structural / presence checks only — not domain business rules.
 */
export interface CommandValidator<T extends Command = Command> {
  validate(command: T): void;
}

export class RequiredFieldsCommandValidator implements CommandValidator {
  constructor(
    private readonly required: ReadonlyArray<{
      field: string;
      message?: string;
    }>,
  ) {}

  validate(command: Command): void {
    const errors: FieldError[] = [];
    const record = command as unknown as Record<string, unknown>;
    for (const { field, message } of this.required) {
      const value = record[field];
      if (value === undefined || value === null || value === "") {
        errors.push({
          field,
          message: message ?? `${field} is required`,
        });
      }
    }
    if (errors.length > 0) {
      throw new ValidationError("Command validation failed", errors);
    }
  }
}

export function validateRequired(
  command: Command,
  fields: string[],
): void {
  new RequiredFieldsCommandValidator(
    fields.map((field) => ({ field })),
  ).validate(command);
}
