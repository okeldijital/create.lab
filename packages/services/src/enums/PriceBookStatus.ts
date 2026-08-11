export const PriceBookStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  RETIRED: "RETIRED",
  ARCHIVED: "ARCHIVED",
} as const;

export type PriceBookStatus =
  (typeof PriceBookStatus)[keyof typeof PriceBookStatus];

export const PRICE_BOOK_TRANSITIONS: Readonly<
  Record<PriceBookStatus, readonly PriceBookStatus[]>
> = {
  [PriceBookStatus.DRAFT]: [
    PriceBookStatus.PUBLISHED,
    PriceBookStatus.ARCHIVED,
  ],
  [PriceBookStatus.PUBLISHED]: [
    PriceBookStatus.RETIRED,
    PriceBookStatus.ARCHIVED,
  ],
  [PriceBookStatus.RETIRED]: [PriceBookStatus.ARCHIVED],
  [PriceBookStatus.ARCHIVED]: [],
};

export function canTransitionPriceBook(
  from: PriceBookStatus,
  to: PriceBookStatus,
): boolean {
  if (from === to) return true;
  return PRICE_BOOK_TRANSITIONS[from].includes(to);
}
