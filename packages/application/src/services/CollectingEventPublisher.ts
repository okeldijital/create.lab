import type { AnyDomainEvent } from "@creative-lab/core";
import type { DomainEventPublisher } from "@creative-lab/organization";

/**
 * Domain EventPublisher adapter used by application handlers.
 * Collects domain events so the application layer can publish integration events
 * after the use case succeeds (never inside domain packages).
 */
export class CollectingEventPublisher implements DomainEventPublisher {
  readonly collected: AnyDomainEvent[] = [];

  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.collected.push(...events);
  }

  drain(): AnyDomainEvent[] {
    const copy = [...this.collected];
    this.collected.length = 0;
    return copy;
  }

  clear(): void {
    this.collected.length = 0;
  }
}
