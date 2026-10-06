import type { Quote } from "@creative-lab/quotation";
import type { QuoteDto } from "../dto/common.js";

export class QuoteMapper {
  static toDto(quote: Quote): QuoteDto {
    return {
      id: quote.id,
      organizationId: quote.organizationId,
      quoteNumber: quote.quoteNumber.value,
      customerId: quote.customerId,
      opportunityId: quote.opportunityId,
      status: quote.status,
      currency:
        typeof quote.currency === "string"
          ? quote.currency
          : quote.currency.code,
      currentVersionId: quote.currentVersionId,
      validUntil: quote.validUntil?.toISOString() ?? null,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
    };
  }
}
