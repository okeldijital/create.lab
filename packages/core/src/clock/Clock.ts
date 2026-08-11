/**
 * Time source abstraction so domain code avoids hard-coding `new Date()`.
 */
export interface Clock {
  now(): Date;
}

/** Production clock using the system wall clock. */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

/**
 * Controllable clock for unit tests.
 * Does not auto-advance unless `advance` is called.
 */
export class TestClock implements Clock {
  private current: Date;

  constructor(initial: Date = new Date(0)) {
    this.current = new Date(initial.getTime());
  }

  now(): Date {
    return new Date(this.current.getTime());
  }

  set(date: Date): void {
    this.current = new Date(date.getTime());
  }

  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}
