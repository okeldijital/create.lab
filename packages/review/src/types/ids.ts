declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type ReviewId = Brand<string, "ReviewId">;
export type ApprovalId = Brand<string, "ApprovalId">;
export type ReviewSessionId = Brand<string, "ReviewSessionId">;
export type ReviewDecisionId = Brand<string, "ReviewDecisionId">;

export function asReviewId(value: string): ReviewId {
  return value as ReviewId;
}
export function asApprovalId(value: string): ApprovalId {
  return value as ApprovalId;
}
export function asReviewSessionId(value: string): ReviewSessionId {
  return value as ReviewSessionId;
}
export function asReviewDecisionId(value: string): ReviewDecisionId {
  return value as ReviewDecisionId;
}
