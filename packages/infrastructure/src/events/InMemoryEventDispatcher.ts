import type { AnyDomainEvent } from "@creative-lab/core";
import type { EventDispatcher, IntegrationEvent } from "@creative-lab/application";
import { EventDispatchError } from "../errors/InfrastructureErrors.js";

type Event = IntegrationEvent | AnyDomainEvent;
type EventHandler = (event: Event) => Promise<void> | void;

export class InMemoryEventDispatcher implements EventDispatcher {
  private readonly handlers = new Map<string, Set<EventHandler>>();
  private readonly publishedEvents: Event[] = [];

  subscribe(eventType: string, handler: EventHandler): () => void {
    const set = this.handlers.get(eventType) ?? new Set<EventHandler>();
    set.add(handler);
    this.handlers.set(eventType, set);
    return () => set.delete(handler);
  }

  async publish(event: Event): Promise<void> {
    this.publishedEvents.push(event);
    const eventType = this.getEventType(event);
    const handlers = this.handlers.get(eventType);
    if (!handlers) return;

    for (const handler of [...handlers]) {
      try {
        await handler(event);
      } catch (error) {
        throw new EventDispatchError(
          `Handler failed for event ${eventType}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  async publishMany(events: readonly Event[]): Promise<void> {
    for (const event of events) await this.publish(event);
  }

  getPublishedEvents(): readonly Event[] {
    return [...this.publishedEvents];
  }

  private getEventType(event: Event): string {
    if ("eventType" in event && typeof event.eventType === "string") return event.eventType;
    if ("eventName" in event && typeof event.eventName === "string") return event.eventName;
    return event.constructor.name;
  }
}
