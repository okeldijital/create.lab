import {
  PaymentService,
  type PaymentServiceDeps,
  asPaymentId,
} from "@creative-lab/billing";
import type { RefundPaymentCommand } from "../../commands/billing/RefundPaymentCommand.js";
import type { PaymentDto } from "../../dto/common.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { PaymentMapper } from "../../mappers/PaymentMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type RefundPaymentHandlerDeps = Omit<PaymentServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
};

export class RefundPaymentHandler implements CommandHandler<RefundPaymentCommand, PaymentDto> {
  readonly commandType = "RefundPayment" as const;
  private readonly service: PaymentService;

  constructor(deps: RefundPaymentHandlerDeps) {
    this.service = new PaymentService(deps);
  }

  async handle(command: RefundPaymentCommand, context: ApplicationContext): Promise<PaymentDto> {
    validateRequired(command, ["paymentId"]);
    const payment = await this.service.getById(asPaymentId(command.paymentId));
    if (String(payment.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }
    return PaymentMapper.toDto(
      await this.service.refund(asPaymentId(command.paymentId), command.amountMinor),
    );
  }
}