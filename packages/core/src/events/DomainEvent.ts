import { generateId } from "../utils/id.js";

export const DOMAIN_EVENT_VERSION = 1 as const;

export type DomainEventProps<
  TType extends string = string,
  TPayload extends Readonly<Record<string, unknown>> = Readonly<Record<string, unknown>>,
> = {
  readonly eventId: string;
  readonly eventType: TType;
  readonly eventVersion: number;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  /** Tenant / organization scope for multi-tenant facts. */
  readonly organizationId: string;
  readonly payload: TPayload;
};

/**
 * Immutable, versioned domain event base.
 * No transport, bus, or infrastructure concerns.
 */
export abstract class DomainEvent<
  TType extends string = string,
  TPayload extends Readonly<Record<string, unknown>> = Readonly<Record<string, unknown>>,
> {
  readonly eventId: string;
  readonly eventType: TType;
  readonly eventVersion: number;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly organizationId: string;
  readonly payload: TPayload;

  protected constructor(props: DomainEventProps<TType, TPayload>) {
    this.eventId = props.eventId;
    this.eventType = props.eventType;
    this.eventVersion = props.eventVersion;
    this.occurredAt = new Date(props.occurredAt.getTime());
    this.aggregateId = props.aggregateId;
    this.organizationId = props.organizationId;
    this.payload = Object.freeze({ ...props.payload }) as TPayload;
    Object.freeze(this);
  }

  protected static nextEventId(): string {
    return generateId();
  }

  protected static now(at?: Date): Date {
    return at ? new Date(at.getTime()) : new Date();
  }

  /** JSON-friendly snapshot for serialization at infrastructure boundaries. */
  toJSON(): DomainEventProps<TType, TPayload> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      eventVersion: this.eventVersion,
      occurredAt: this.occurredAt,
      aggregateId: this.aggregateId,
      organizationId: this.organizationId,
      payload: this.payload,
    };
  }
}

export type AnyDomainEvent = DomainEvent<string, Readonly<Record<string, unknown>>>;
