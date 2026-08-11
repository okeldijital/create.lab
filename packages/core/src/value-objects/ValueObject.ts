import { deepEqual } from "../utils/deep-equal.js";

/**
 * Immutable value object base. Equality is structural (by props).
 */
export abstract class ValueObject<TProps> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze(
      typeof props === "object" && props !== null ? { ...(props as object) } : props,
    ) as Readonly<TProps>;
    Object.freeze(this);
  }

  equals(other: ValueObject<TProps> | null | undefined): boolean {
    if (other == null) return false;
    if (this.constructor !== other.constructor) return false;
    return deepEqual(this.props, other.props);
  }
}
