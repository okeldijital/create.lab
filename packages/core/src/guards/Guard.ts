/**
 * Reusable argument validation helpers for domain construction.
 * Throws Error (or a provided error factory) on failure.
 */
export class Guard {
  static againstNull<T>(value: T | null, argumentName: string): asserts value is T {
    if (value === null) {
      throw new Error(`${argumentName} must not be null.`);
    }
  }

  static againstUndefined<T>(value: T | undefined, argumentName: string): asserts value is T {
    if (value === undefined) {
      throw new Error(`${argumentName} must not be undefined.`);
    }
  }

  static againstNullOrUndefined<T>(
    value: T | null | undefined,
    argumentName: string,
  ): asserts value is T {
    if (value === null || value === undefined) {
      throw new Error(`${argumentName} must not be null or undefined.`);
    }
  }

  static againstEmpty(value: string, argumentName: string): string {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`${argumentName} must not be empty.`);
    }
    return value.trim();
  }

  static againstNegative(value: number, argumentName: string): number {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${argumentName} must not be negative.`);
    }
    return value;
  }

  static againstInvalid(condition: boolean, message: string): asserts condition {
    if (!condition) {
      throw new Error(message);
    }
  }
}
