import type { Query } from "./Query.js";

export type ListPaymentsQuery = Query<"ListPayments"> & {
  readonly invoiceId: string;
};

export function listPaymentsQuery(invoiceId: string): ListPaymentsQuery {
  return { type: "ListPayments", invoiceId };
}