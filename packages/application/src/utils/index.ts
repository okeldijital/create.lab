import { generateId } from "@creative-lab/core";
import type { AnyDomainEvent } from "@creative-lab/core";
import {
  INTEGRATION_EVENT_VERSION,
  type IntegrationEvent,
} from "../events/IntegrationEvent.js";

export function newCorrelationId(): string {
  return generateId();
}

/**
 * Maps a domain event into an integration event envelope for cross-boundary publish.
 */
export function toIntegrationEvent(
  domainEvent: AnyDomainEvent,
  correlationId?: string,
): IntegrationEvent {
  return {
    eventId: domainEvent.eventId,
    eventType: domainEvent.eventType,
    eventVersion: INTEGRATION_EVENT_VERSION,
    occurredAt: domainEvent.occurredAt,
    organizationId: domainEvent.organizationId,
    aggregateId: domainEvent.aggregateId,
    correlationId,
    payload: domainEvent.payload as Readonly<Record<string, unknown>>,
  };
}

export function toIntegrationEvents(
  domainEvents: readonly AnyDomainEvent[],
  correlationId?: string,
): IntegrationEvent[] {
  return domainEvents.map((e) => toIntegrationEvent(e, correlationId));
}
