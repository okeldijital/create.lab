export const QuoteStatus = {
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
  ARCHIVED: "ARCHIVED",
} as const;

export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export const QUOTE_TRANSITIONS: Readonly<
  Record<QuoteStatus, readonly QuoteStatus[]>
> = {
  [QuoteStatus.DRAFT]: [QuoteStatus.ISSUED, QuoteStatus.ARCHIVED],
  [QuoteStatus.ISSUED]: [
    QuoteStatus.ACCEPTED,
    QuoteStatus.DECLINED,
    QuoteStatus.EXPIRED,
    QuoteStatus.ARCHIVED,
  ],
  [QuoteStatus.ACCEPTED]: [QuoteStatus.ARCHIVED],
  [QuoteStatus.DECLINED]: [QuoteStatus.ARCHIVED],
  [QuoteStatus.EXPIRED]: [QuoteStatus.ARCHIVED],
  [QuoteStatus.ARCHIVED]: [],
};

export function canTransitionQuote(
  from: QuoteStatus,
  to: QuoteStatus,
): boolean {
  if (from === to) return true;
  return QUOTE_TRANSITIONS[from].includes(to);
}
