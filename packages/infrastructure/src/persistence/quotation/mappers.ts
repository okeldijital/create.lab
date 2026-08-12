import type {
  Quote,
  QuoteApproval,
  QuoteApprovalSnapshot,
  QuoteLine,
  QuoteLineSnapshot,
  QuoteSnapshot,
  QuoteVersion,
  QuoteVersionSnapshot,
} from "@creative-lab/quotation";
import {
  asQuoteApprovalId,
  asQuoteId,
  asQuoteLineId,
  asQuoteVersionId,
} from "@creative-lab/quotation";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { quoteApprovals, quoteLines, quoteVersions, quotes } from "./schema.js";

type QuoteRow = InferSelectModel<typeof quotes>;
type QuoteVersionRow = InferSelectModel<typeof quoteVersions>;
type QuoteLineRow = InferSelectModel<typeof quoteLines>;
type QuoteApprovalRow = InferSelectModel<typeof quoteApprovals>;

export const QuoteMapper = {
  toRow(quote: Quote): InferInsertModel<typeof quotes> {
    const snapshot = quote.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      quoteNumber: snapshot.quoteNumber,
      customerId: snapshot.customerId,
      opportunityId: snapshot.opportunityId,
      currency: snapshot.currency,
      status: snapshot.status,
      currentVersionId: snapshot.currentVersionId,
      validUntil: snapshot.validUntil,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      archivedAt: snapshot.archivedAt,
    };
  },
  fromRow(row: QuoteRow): Quote {
    const snapshot: QuoteSnapshot = {
      id: asQuoteId(row.id),
      organizationId: row.organizationId as QuoteSnapshot["organizationId"],
      quoteNumber: row.quoteNumber,
      customerId: row.customerId as QuoteSnapshot["customerId"],
      opportunityId: row.opportunityId,
      currency: row.currency,
      status: row.status as QuoteSnapshot["status"],
      currentVersionId: row.currentVersionId,
      validUntil: row.validUntil,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archivedAt: row.archivedAt,
    };
    return Quote.reconstitute(snapshot);
  },
};

export const QuoteVersionMapper = {
  toRow(version: QuoteVersion): InferInsertModel<typeof quoteVersions> {
    const snapshot = version.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      quoteId: snapshot.quoteId,
      versionNumber: snapshot.versionNumber,
      lineIds: snapshot.lineIds as string[],
      subtotalMinor: snapshot.subtotalMinor,
      discountMinor: snapshot.discountMinor,
      totalMinor: snapshot.totalMinor,
      currency: snapshot.currency,
      status: snapshot.status,
      locked: snapshot.locked,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: QuoteVersionRow): QuoteVersion {
    const snapshot: QuoteVersionSnapshot = {
      id: asQuoteVersionId(row.id),
      organizationId: row.organizationId as QuoteVersionSnapshot["organizationId"],
      quoteId: asQuoteId(row.quoteId),
      versionNumber: row.versionNumber,
      lineIds: (row.lineIds ?? []).map(asQuoteLineId),
      subtotalMinor: row.subtotalMinor,
      discountMinor: row.discountMinor,
      totalMinor: row.totalMinor,
      currency: row.currency,
      status: row.status as QuoteVersionSnapshot["status"],
      locked: row.locked,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return QuoteVersion.reconstitute(snapshot);
  },
};

export const QuoteLineMapper = {
  toRow(line: QuoteLine): InferInsertModel<typeof quoteLines> {
    const snapshot = line.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      quoteVersionId: snapshot.quoteVersionId,
      serviceId: snapshot.serviceId,
      description: snapshot.description,
      quantity: snapshot.quantity,
      unitPriceMinor: snapshot.unitPriceMinor,
      lineTotalMinor: snapshot.lineTotalMinor,
      currency: snapshot.currency,
      createdAt: snapshot.createdAt,
    };
  },
  fromRow(row: QuoteLineRow): QuoteLine {
    const snapshot: QuoteLineSnapshot = {
      id: asQuoteLineId(row.id),
      organizationId: row.organizationId as QuoteLineSnapshot["organizationId"],
      quoteVersionId: asQuoteVersionId(row.quoteVersionId),
      serviceId: row.serviceId as QuoteLineSnapshot["serviceId"],
      description: row.description,
      quantity: row.quantity,
      unitPriceMinor: row.unitPriceMinor,
      lineTotalMinor: row.lineTotalMinor,
      currency: row.currency,
      createdAt: row.createdAt,
    };
    return QuoteLine.reconstitute(snapshot);
  },
};

export const QuoteApprovalMapper = {
  toRow(approval: QuoteApproval): InferInsertModel<typeof quoteApprovals> {
    const snapshot = approval.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      quoteId: snapshot.quoteId,
      decision: snapshot.decision,
      decisionDate: snapshot.decisionDate,
      notes: snapshot.notes,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: QuoteApprovalRow): QuoteApproval {
    const snapshot: QuoteApprovalSnapshot = {
      id: asQuoteApprovalId(row.id),
      organizationId: row.organizationId as QuoteApprovalSnapshot["organizationId"],
      quoteId: asQuoteId(row.quoteId),
      decision: row.decision as QuoteApprovalSnapshot["decision"],
      decisionDate: row.decisionDate,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return QuoteApproval.reconstitute(snapshot);
  },
};
