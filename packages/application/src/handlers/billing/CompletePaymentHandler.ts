import {
  PaymentService,
  type PaymentServiceDeps,
  asPaymentId,
} from "@creative-lab/billing";
import type { CompletePaymentCommand } from "../../commands/billing/CompletePaymentCommand.js";
import type { PaymentDto } from "../../dto/common.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { PaymentMapper } from "../../mappers/PaymentMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CompletePaymentHandlerDeps = Omit<PaymentServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
};

export class CompletePaymentHandler implements CommandHandler<CompletePaymentCommand, PaymentDto> {
  readonly commandType = "CompletePayment" as const;
  private readonly service: PaymentService;

  constructor(deps: CompletePaymentHandlerDeps) {
    this.service = new PaymentService(deps);
  }

  async handle(command: CompletePaymentCommand, context: ApplicationContext): Promise<PaymentDto> {
    validateRequired(command, ["paymentId"]);
    const payment = await this.service.getById(asPaymentId(command.paymentId));
    if (String(payment.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }
    return PaymentMapper.toDto(await this.service.complete(asPaymentId(command.paymentId)));
  }
}