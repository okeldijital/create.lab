import type { AnyDomainEvent } from "@creative-lab/core";
import type { IntegrationEvent } from "./IntegrationEvent.js";

/**
 * Application event dispatch port.
 * Publishes domain and/or integration events after successful use cases.
 * Infrastructure implements brokers later.
 */
export interface EventDispatcher {
  publish(
    event: IntegrationEvent | AnyDomainEvent,
  ): Promise<void>;
  publishMany(
    events: readonly (IntegrationEvent | AnyDomainEvent)[],
  ): Promise<void>;
}
