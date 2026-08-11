import type { Query } from "../queries/Query.js";
import { ValidationError } from "../errors/ApplicationErrors.js";
import type { FieldError } from "./CommandValidator.js";

/**
 * Validates query shape before handler execution.
 */
export interface QueryValidator<T extends Query = Query> {
  validate(query: T): void;
}

export class RequiredFieldsQueryValidator implements QueryValidator {
  constructor(
    private readonly required: ReadonlyArray<{
      field: string;
      message?: string;
    }>,
  ) {}

  validate(query: Query): void {
    const errors: FieldError[] = [];
    const record = query as unknown as Record<string, unknown>;
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
      throw new ValidationError("Query validation failed", errors);
    }
  }
}

export function validateQueryRequired(query: Query, fields: string[]): void {
  new RequiredFieldsQueryValidator(fields.map((field) => ({ field }))).validate(
    query,
  );
}
