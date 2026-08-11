import {
  Invoice,
  type CreateInvoiceProps,
} from "../aggregates/Invoice/Invoice.js";
import {
  InvoiceLine,
  type CreateInvoiceLineProps,
} from "../aggregates/InvoiceLine/InvoiceLine.js";
import {
  Payment,
  type CreatePaymentProps,
} from "../aggregates/Payment/Payment.js";
import {
  CreditNote,
  type CreateCreditNoteProps,
} from "../aggregates/CreditNote/CreditNote.js";

export const InvoiceFactory = {
  create: (props: CreateInvoiceProps) => Invoice.create(props),
  reconstitute: Invoice.reconstitute.bind(Invoice),
};

export const InvoiceLineFactory = {
  create: (props: CreateInvoiceLineProps) => InvoiceLine.create(props),
  reconstitute: InvoiceLine.reconstitute.bind(InvoiceLine),
};

export const PaymentFactory = {
  create: (props: CreatePaymentProps) => Payment.create(props),
  reconstitute: Payment.reconstitute.bind(Payment),
};

export const CreditNoteFactory = {
  create: (props: CreateCreditNoteProps) => CreditNote.create(props),
  reconstitute: CreditNote.reconstitute.bind(CreditNote),
};
