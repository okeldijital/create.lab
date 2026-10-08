import {
  PaymentService,
  type PaymentServiceDeps,
  asInvoiceId,
  asPaymentId,
} from "@creative-lab/billing";
import type { RecordPaymentCommand } from "../../commands/billing/RecordPaymentCommand.js";
import type { PaymentDto } from "../../dto/common.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { PaymentMapper } from "../../mappers/PaymentMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type RecordPaymentHandlerDeps = Omit<PaymentServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
};

export class RecordPaymentHandler implements CommandHandler<RecordPaymentCommand, PaymentDto> {
  readonly commandType = "RecordPayment" as const;
  private readonly service: PaymentService;

  constructor(deps: RecordPaymentHandlerDeps) {
    this.service = new PaymentService(deps);
  }

  async handle(command: RecordPaymentCommand, context: ApplicationContext): Promise<PaymentDto> {
    validateRequired(command, ["invoiceId", "reference"]);
    const invoice = await this.service["deps"].invoiceRepository.findById(asInvoiceId(command.invoiceId));
    if (!invoice || String(invoice.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }

    const payment = await this.service.record({
      organizationId: context.organizationId,
      invoiceId: asInvoiceId(command.invoiceId),
      reference: command.reference,
      amountMinor: command.amountMinor,
      paymentDate: command.paymentDate,
      method: command.method,
      completeImmediately: command.completeImmediately,
    });
    return PaymentMapper.toDto(payment);
  }
}