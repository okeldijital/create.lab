import { asInvoiceId, type InvoiceRepository } from "@creative-lab/billing";
import type { InvoiceDetailDto } from "../../dto/common.js";
import { AuthorizationError, NotFoundError } from "../../errors/ApplicationErrors.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { InvoiceMapper } from "../../mappers/InvoiceMapper.js";
import type { GetInvoiceQuery } from "../../queries/GetInvoiceQuery.js";
import type { ApplicationContext } from "../../types/context.js";

export type GetInvoiceHandlerDeps = { invoiceRepository: InvoiceRepository };

export class GetInvoiceHandler implements QueryHandler<GetInvoiceQuery, InvoiceDetailDto> {
  readonly queryType = "GetInvoice" as const;
  constructor(private readonly deps: GetInvoiceHandlerDeps) {}

  async handle(query: GetInvoiceQuery, context: ApplicationContext): Promise<InvoiceDetailDto> {
    const invoice = await this.deps.invoiceRepository.findById(asInvoiceId(query.invoiceId));
    if (!invoice) throw new NotFoundError("Invoice", query.invoiceId);
    if (String(invoice.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }
    return InvoiceMapper.toDetailDto(invoice);
  }
}