declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type QuoteId = Brand<string, "QuoteId">;
export type QuoteVersionId = Brand<string, "QuoteVersionId">;
export type QuoteLineId = Brand<string, "QuoteLineId">;
export type QuoteApprovalId = Brand<string, "QuoteApprovalId">;

export function asQuoteId(value: string): QuoteId {
  return value as QuoteId;
}
export function asQuoteVersionId(value: string): QuoteVersionId {
  return value as QuoteVersionId;
}
export function asQuoteLineId(value: string): QuoteLineId {
  return value as QuoteLineId;
}
export function asQuoteApprovalId(value: string): QuoteApprovalId {
  return value as QuoteApprovalId;
}
