import type { Payment } from "@creative-lab/billing";
import type { PaymentDto } from "../dto/common.js";

export class PaymentMapper {
  static toDto(payment: Payment): PaymentDto {
    return {
      id: payment.id,
      organizationId: payment.organizationId,
      invoiceId: payment.invoiceId,
      reference: payment.reference.value,
      amountMinor: payment.amount.minorUnits,
      currency: payment.amount.currencyCode,
      paymentDate: payment.paymentDate.toISOString(),
      method: payment.method,
      status: payment.status,
      refundedMinor: payment.refunded.minorUnits,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }
}