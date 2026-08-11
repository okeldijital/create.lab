import type { AnyDomainEvent } from "@creative-lab/core";

/**
 * Port for publishing domain events after successful state change.
 * Infrastructure provides the concrete bus/outbox implementation.
 */
export interface DomainEventPublisher {
  publish(events: readonly AnyDomainEvent[]): Promise<void>;
}
