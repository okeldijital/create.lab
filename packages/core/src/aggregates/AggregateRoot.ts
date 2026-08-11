import { Entity } from "../entities/Entity.js";
import type { AnyDomainEvent } from "../events/DomainEvent.js";

/**
 * Aggregate root: entity that collects domain events for the unit of work.
 * No persistence or infrastructure concerns.
 */
export abstract class AggregateRoot<TId> extends Entity<TId> {
  private _domainEvents: AnyDomainEvent[] = [];

  protected constructor(id: TId) {
    super(id);
  }

  /** Record a domain event raised by this aggregate. */
  protected record(event: AnyDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Drain pending domain events (typically after successful persistence).
   * Returns a frozen copy and clears the internal collection.
   */
  pullDomainEvents(): readonly AnyDomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  /** Discard pending events without returning them. */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /** Snapshot of currently pending events (does not clear). */
  get domainEvents(): readonly AnyDomainEvent[] {
    return [...this._domainEvents];
  }
}
