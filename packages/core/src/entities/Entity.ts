/**
 * Entity with a durable identity. Equality is by identity, not attributes.
 */
export abstract class Entity<TId> {
  protected constructor(protected readonly _id: TId) {}

  get id(): TId {
    return this._id;
  }

  equals(other: Entity<TId> | null | undefined): boolean {
    if (other == null) return false;
    if (this.constructor !== other.constructor) return false;
    return this.sameIdentityAs(other);
  }

  sameIdentityAs(other: Entity<TId>): boolean {
    return identitiesEqual(this._id, other._id);
  }
}

function identitiesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (
    a != null &&
    b != null &&
    typeof a === "object" &&
    typeof b === "object" &&
    "equals" in a &&
    typeof (a as { equals: unknown }).equals === "function"
  ) {
    return (a as { equals: (other: unknown) => boolean }).equals(b);
  }
  return false;
}
