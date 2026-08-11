import type { InvoiceRepository } from "@creative-lab/billing";
import type { InvoiceDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { InvoiceMapper } from "../../mappers/InvoiceMapper.js";
import type { FindInvoicesQuery } from "../../queries/FindInvoicesQuery.js";
import type { ApplicationContext } from "../../types/context.js";

export type FindInvoicesHandlerDeps = {
  invoiceRepository: InvoiceRepository;
};

export class FindInvoicesHandler
  implements QueryHandler<FindInvoicesQuery, InvoiceDto[]>
{
  readonly queryType = "FindInvoices" as const;

  constructor(private readonly deps: FindInvoicesHandlerDeps) {}

  async handle(
    query: FindInvoicesQuery,
    context: ApplicationContext,
  ): Promise<InvoiceDto[]> {
    let invoices = await this.deps.invoiceRepository.findByOrganization(
      context.organizationId,
    );
    if (query.status) {
      invoices = invoices.filter((i) => i.status === query.status);
    }
    if (query.customerId) {
      invoices = invoices.filter((i) => i.customerId === query.customerId);
    }
    return invoices.map((i) => InvoiceMapper.toDto(i));
  }
}
