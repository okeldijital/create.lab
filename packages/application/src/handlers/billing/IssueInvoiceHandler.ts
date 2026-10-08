import { InvoiceService, type InvoiceServiceDeps, asInvoiceId } from "@creative-lab/billing";
import type { IssueInvoiceCommand } from "../../commands/billing/IssueInvoiceCommand.js";
import type { InvoiceDto } from "../../dto/common.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { InvoiceMapper } from "../../mappers/InvoiceMapper.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type IssueInvoiceHandlerDeps = Omit<InvoiceServiceDeps, "eventPublisher"> & {
  eventPublisher: InvoiceServiceDeps["eventPublisher"];
};

export class IssueInvoiceHandler implements CommandHandler<IssueInvoiceCommand, InvoiceDto> {
  readonly commandType = "IssueInvoice" as const;
  private readonly service: InvoiceService;

  constructor(deps: IssueInvoiceHandlerDeps) {
    this.service = new InvoiceService(deps);
  }

  async handle(command: IssueInvoiceCommand, context: ApplicationContext): Promise<InvoiceDto> {
    validateRequired(command, ["invoiceId"]);
    const invoiceId = asInvoiceId(command.invoiceId);
    const existing = await this.service.getById(invoiceId);
    if (String(existing.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }
    return InvoiceMapper.toDto(await this.service.issue(invoiceId));
  }
}
