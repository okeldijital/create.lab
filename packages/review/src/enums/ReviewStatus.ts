export const ReviewStatus = {
  DRAFT: "DRAFT",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

export const REVIEW_TRANSITIONS: Readonly<
  Record<ReviewStatus, readonly ReviewStatus[]>
> = {
  [ReviewStatus.DRAFT]: [ReviewStatus.IN_REVIEW, ReviewStatus.ARCHIVED],
  [ReviewStatus.IN_REVIEW]: [
    ReviewStatus.APPROVED,
    ReviewStatus.REJECTED,
    ReviewStatus.ARCHIVED,
  ],
  [ReviewStatus.APPROVED]: [ReviewStatus.ARCHIVED],
  [ReviewStatus.REJECTED]: [ReviewStatus.IN_REVIEW, ReviewStatus.ARCHIVED],
  [ReviewStatus.ARCHIVED]: [],
};

export function canTransitionReview(
  from: ReviewStatus,
  to: ReviewStatus,
): boolean {
  if (from === to) return true;
  return REVIEW_TRANSITIONS[from].includes(to);
}
