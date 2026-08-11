import type { AnyDomainEvent } from "@creative-lab/core";

export interface DomainEventPublisher {
  publish(events: readonly AnyDomainEvent[]): Promise<void>;
}
