import type { Query } from "./Query.js";

export type GetQuoteQuery = Query<"GetQuote"> & {
  readonly quoteId: string;
};

export function getQuoteQuery(quoteId: string): GetQuoteQuery {
  return { type: "GetQuote", quoteId };
}
