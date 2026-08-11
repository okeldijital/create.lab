declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type InvoiceId = Brand<string, "InvoiceId">;
export type InvoiceLineId = Brand<string, "InvoiceLineId">;
export type PaymentId = Brand<string, "PaymentId">;
export type CreditNoteId = Brand<string, "CreditNoteId">;

export function asInvoiceId(value: string): InvoiceId {
  return value as InvoiceId;
}
export function asInvoiceLineId(value: string): InvoiceLineId {
  return value as InvoiceLineId;
}
export function asPaymentId(value: string): PaymentId {
  return value as PaymentId;
}
export function asCreditNoteId(value: string): CreditNoteId {
  return value as CreditNoteId;
}
