import { describe, expect, it } from "vitest";
import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import {
  INTEGRATION_EVENT_VERSION,
  type IntegrationEvent,
} from "../../events/IntegrationEvent.js";
import {
  newCorrelationId,
  toIntegrationEvent,
  toIntegrationEvents,
} from "../../utils/index.js";
import { InMemoryEventDispatcher } from "../helpers/fakes.js";

class SampleEvent extends DomainEvent<
  "SampleEvent",
  Readonly<{ value: string }>
> {
  static create(): SampleEvent {
    return new SampleEvent({
      eventId: DomainEvent.nextEventId(),
      eventType: "SampleEvent",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(),
      aggregateId: "agg-1",
      organizationId: "org-1",
      payload: { value: "x" },
    });
  }
}

describe("Event dispatch & mapping", () => {
  it("toIntegrationEvent maps domain event", () => {
    const d = SampleEvent.create();
    const i = toIntegrationEvent(d, "corr");
    expect(i.eventType).toBe("SampleEvent");
    expect(i.eventVersion).toBe(INTEGRATION_EVENT_VERSION);
    expect(i.correlationId).toBe("corr");
    expect(i.payload).toEqual({ value: "x" });
    expect(i.organizationId).toBe("org-1");
  });

  it("toIntegrationEvents maps many", () => {
    const events = toIntegrationEvents([
      SampleEvent.create(),
      SampleEvent.create(),
    ]);
    expect(events).toHaveLength(2);
  });

  it("EventDispatcher publish and publishMany", async () => {
    const dispatcher = new InMemoryEventDispatcher();
    const e: IntegrationEvent = {
      eventId: "1",
      eventType: "X",
      eventVersion: 1,
      occurredAt: new Date(),
      organizationId: "o",
      aggregateId: "a",
      payload: {},
    };
    await dispatcher.publish(e);
    await dispatcher.publishMany([e, e]);
    expect(dispatcher.events).toHaveLength(3);
  });

  it("newCorrelationId generates id", () => {
    expect(newCorrelationId().length).toBeGreaterThan(0);
  });

  it("integration events are plain immutable-friendly objects", () => {
    const d = SampleEvent.create();
    const i = toIntegrationEvent(d);
    expect(i.aggregateId).toBe("agg-1");
  });
});
