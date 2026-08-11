declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type CustomerId = Brand<string, "CustomerId">;
export type ContactId = Brand<string, "ContactId">;
export type OpportunityId = Brand<string, "OpportunityId">;
export type InteractionId = Brand<string, "InteractionId">;

export function asCustomerId(value: string): CustomerId {
  return value as CustomerId;
}
export function asContactId(value: string): ContactId {
  return value as ContactId;
}
export function asOpportunityId(value: string): OpportunityId {
  return value as OpportunityId;
}
export function asInteractionId(value: string): InteractionId {
  return value as InteractionId;
}
