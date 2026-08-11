/**
 * Strongly typed identity base for aggregate and entity identifiers.
 * Domain-specific IDs (OrganizationId, WorkerId, …) should extend this class.
 * Branded-string IDs may continue to coexist until fully migrated.
 */
export abstract class Identity {
  protected constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error("Identity value cannot be empty.");
    }
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Identity | null | undefined): boolean {
    if (other == null) return false;
    if (this.constructor !== other.constructor) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  /** JSON serialization as plain string. */
  toJSON(): string {
    return this._value;
  }
}
