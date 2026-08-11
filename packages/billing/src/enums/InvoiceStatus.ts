export const InvoiceStatus = {
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  VOID: "VOID",
  ARCHIVED: "ARCHIVED",
} as const;

export type InvoiceStatus =
  (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const INVOICE_TRANSITIONS: Readonly<
  Record<InvoiceStatus, readonly InvoiceStatus[]>
> = {
  [InvoiceStatus.DRAFT]: [InvoiceStatus.ISSUED, InvoiceStatus.ARCHIVED],
  [InvoiceStatus.ISSUED]: [
    InvoiceStatus.PARTIALLY_PAID,
    InvoiceStatus.PAID,
    InvoiceStatus.VOID,
    InvoiceStatus.ARCHIVED,
  ],
  [InvoiceStatus.PARTIALLY_PAID]: [
    InvoiceStatus.PAID,
    InvoiceStatus.VOID,
    InvoiceStatus.ARCHIVED,
  ],
  [InvoiceStatus.PAID]: [InvoiceStatus.ARCHIVED],
  [InvoiceStatus.VOID]: [InvoiceStatus.ARCHIVED],
  [InvoiceStatus.ARCHIVED]: [],
};

export function canTransitionInvoice(
  from: InvoiceStatus,
  to: InvoiceStatus,
): boolean {
  if (from === to) return true;
  return INVOICE_TRANSITIONS[from].includes(to);
}
