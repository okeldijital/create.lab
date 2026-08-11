/**
 * Application / integration event envelope.
 * Domain events may be wrapped or re-published as integration events here.
 */
export type IntegrationEvent<
  TType extends string = string,
  TPayload extends Readonly<Record<string, unknown>> = Readonly<
    Record<string, unknown>
  >,
> = {
  readonly eventId: string;
  readonly eventType: TType;
  readonly eventVersion: number;
  readonly occurredAt: Date;
  readonly organizationId: string;
  readonly aggregateId: string;
  readonly correlationId?: string;
  readonly payload: TPayload;
};

export const INTEGRATION_EVENT_VERSION = 1 as const;
