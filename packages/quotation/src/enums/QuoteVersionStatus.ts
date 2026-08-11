export const QuoteVersionStatus = {
  CURRENT: "CURRENT",
  SUPERSEDED: "SUPERSEDED",
} as const;

export type QuoteVersionStatus =
  (typeof QuoteVersionStatus)[keyof typeof QuoteVersionStatus];
