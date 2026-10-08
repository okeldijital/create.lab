import type { Query } from "./Query.js";

export type GetInvoiceQuery = Query<"GetInvoice"> & {
  readonly invoiceId: string;
};

export function getInvoiceQuery(invoiceId: string): GetInvoiceQuery {
  return { type: "GetInvoice", invoiceId };
}