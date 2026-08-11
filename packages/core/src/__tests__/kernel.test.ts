import { describe, expect, it } from "vitest";
import {
  AggregateRoot,
  DomainEvent,
  DOMAIN_EVENT_VERSION,
  Entity,
  Failure,
  Guard,
  Identity,
  Result,
  Specification,
  Success,
  SystemClock,
  TestClock,
  ValueObject,
} from "../index.js";

class SampleId extends Identity {
  static create(value: string): SampleId {
    return new SampleId(value);
  }
}

class SampleEntity extends Entity<string> {
  constructor(
    id: string,
    readonly label: string,
  ) {
    super(id);
  }
}

class SampleName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(value: string): SampleName {
    return new SampleName(value);
  }
  get value(): string {
    return this.props.value;
  }
}

class SampleEvent extends DomainEvent<"SampleEvent", { n: number }> {
  static create(aggregateId: string, n: number): SampleEvent {
    return new SampleEvent({
      eventId: DomainEvent.nextEventId(),
      eventType: "SampleEvent",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(),
      aggregateId,
      organizationId: "org-1",
      payload: { n },
    });
  }
}

class SampleAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id);
  }
  doWork(n: number): void {
    this.record(SampleEvent.create(this.id, n));
  }
}

class IsPositive extends Specification<number> {
  isSatisfiedBy(candidate: number): boolean {
    return candidate > 0;
  }
}

class IsEven extends Specification<number> {
  isSatisfiedBy(candidate: number): boolean {
    return candidate % 2 === 0;
  }
}

describe("Entity", () => {
  it("equality is by identity", () => {
    const a = new SampleEntity("1", "a");
    const b = new SampleEntity("1", "b");
    const c = new SampleEntity("2", "a");
    expect(a.equals(b)).toBe(true);
    expect(a.sameIdentityAs(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.equals(null)).toBe(false);
  });
});

describe("ValueObject", () => {
  it("equality is structural", () => {
    const a = SampleName.create("Acme");
    const b = SampleName.create("Acme");
    const c = SampleName.create("Other");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.equals(null)).toBe(false);
  });

  it("is frozen", () => {
    const a = SampleName.create("Acme");
    expect(Object.isFrozen(a)).toBe(true);
  });
});

describe("AggregateRoot", () => {
  it("records and pulls domain events", () => {
    const agg = new SampleAggregate("agg-1");
    agg.doWork(1);
    agg.doWork(2);
    expect(agg.domainEvents).toHaveLength(2);
    const pulled = agg.pullDomainEvents();
    expect(pulled).toHaveLength(2);
    expect(agg.domainEvents).toHaveLength(0);
    expect(pulled[0]).toBeInstanceOf(SampleEvent);
    expect(Object.isFrozen(pulled[0])).toBe(true);
  });

  it("clearDomainEvents discards pending", () => {
    const agg = new SampleAggregate("agg-1");
    agg.doWork(1);
    agg.clearDomainEvents();
    expect(agg.pullDomainEvents()).toHaveLength(0);
  });
});

describe("DomainEvent", () => {
  it("is immutable and versioned", () => {
    const event = SampleEvent.create("a1", 42);
    expect(event.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(event.payload.n).toBe(42);
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
    const json = event.toJSON();
    expect(json.organizationId).toBe("org-1");
  });
});

describe("Identity", () => {
  it("equality by type and value", () => {
    const a = SampleId.create("x");
    const b = SampleId.create("x");
    const c = SampleId.create("y");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.toJSON()).toBe("x");
  });

  it("rejects empty value", () => {
    expect(() => SampleId.create("")).toThrow();
  });
});

describe("Specification", () => {
  it("composes and / or / not", () => {
    const positive = new IsPositive();
    const even = new IsEven();
    expect(positive.and(even).isSatisfiedBy(4)).toBe(true);
    expect(positive.and(even).isSatisfiedBy(3)).toBe(false);
    expect(positive.or(even).isSatisfiedBy(3)).toBe(true);
    expect(positive.not().isSatisfiedBy(-1)).toBe(true);
    expect(positive.not().isSatisfiedBy(1)).toBe(false);
  });
});

describe("Clock", () => {
  it("SystemClock returns a Date", () => {
    const clock = new SystemClock();
    expect(clock.now()).toBeInstanceOf(Date);
  });

  it("TestClock is controllable", () => {
    const clock = new TestClock(new Date("2020-01-01T00:00:00.000Z"));
    expect(clock.now().toISOString()).toBe("2020-01-01T00:00:00.000Z");
    clock.advance(1000);
    expect(clock.now().getTime()).toBe(new Date("2020-01-01T00:00:01.000Z").getTime());
    clock.set(new Date("2021-06-01T12:00:00.000Z"));
    expect(clock.now().toISOString()).toBe("2021-06-01T12:00:00.000Z");
  });
});

describe("Guard", () => {
  it("againstNull / againstUndefined / againstEmpty", () => {
    expect(() => Guard.againstNull(null, "x")).toThrow(/null/);
    expect(() => Guard.againstUndefined(undefined, "x")).toThrow(/undefined/);
    expect(Guard.againstEmpty("  hi  ", "name")).toBe("hi");
    expect(() => Guard.againstEmpty("   ", "name")).toThrow(/empty/);
  });

  it("againstNegative / againstInvalid", () => {
    expect(Guard.againstNegative(0, "n")).toBe(0);
    expect(() => Guard.againstNegative(-1, "n")).toThrow(/negative/);
    expect(() => Guard.againstInvalid(false, "bad")).toThrow(/bad/);
    Guard.againstInvalid(true, "ok");
  });
});

describe("Result", () => {
  it("success and failure", () => {
    const ok = Result.ok(42);
    const fail = Result.fail("nope");
    expect(ok).toBeInstanceOf(Success);
    expect(ok.isSuccess()).toBe(true);
    expect(ok.value).toBe(42);
    expect(fail).toBeInstanceOf(Failure);
    expect(fail.isFailure()).toBe(true);
    expect(fail.error).toBe("nope");
    expect(ok.ok).toBe(true);
    expect(fail.ok).toBe(false);
  });
});
