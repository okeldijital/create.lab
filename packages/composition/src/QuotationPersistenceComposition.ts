import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import {
  PostgresQuoteApprovalRepository,
  PostgresQuoteLineRepository,
  PostgresQuoteRepository,
  PostgresQuoteVersionRepository,
} from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const QUOTATION_REPOSITORY_KEYS = {
  quote: "quote",
  quoteVersion: "quoteVersion",
  quoteLine: "quoteLine",
  quoteApproval: "quoteApproval",
} as const;

export function registerPostgresQuotationRepositories(
  composition: ApplicationComposition,
  database: DrizzleDatabase,
): void {
  composition.repositories.register(QUOTATION_REPOSITORY_KEYS.quote, new PostgresQuoteRepository(database));
  composition.repositories.register(QUOTATION_REPOSITORY_KEYS.quoteVersion, new PostgresQuoteVersionRepository(database));
  composition.repositories.register(QUOTATION_REPOSITORY_KEYS.quoteLine, new PostgresQuoteLineRepository(database));
  composition.repositories.register(QUOTATION_REPOSITORY_KEYS.quoteApproval, new PostgresQuoteApprovalRepository(database));
}
