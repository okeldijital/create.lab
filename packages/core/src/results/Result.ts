/**
 * Functional result type for future command handlers.
 * Optional utility — domains may continue to throw DomainError.
 */
export type Result<T, E = string> = Success<T> | Failure<E>;

export class Success<T> {
  readonly ok = true as const;

  constructor(readonly value: T) {
    Object.freeze(this);
  }

  static of<T>(value: T): Success<T> {
    return new Success(value);
  }

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<never> {
    return false;
  }
}

export class Failure<E = string> {
  readonly ok = false as const;

  constructor(readonly error: E) {
    Object.freeze(this);
  }

  static of<E>(error: E): Failure<E> {
    return new Failure(error);
  }

  isSuccess(): this is Success<never> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }
}

export const Result = {
  ok<T>(value: T): Success<T> {
    return Success.of(value);
  },
  fail<E>(error: E): Failure<E> {
    return Failure.of(error);
  },
};
