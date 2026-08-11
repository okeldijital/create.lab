import type { Command } from "../Command.js";

export type ApproveReviewCommand = Command<"ApproveReview"> & {
  readonly reviewId: string;
  readonly decisionNote?: string | null;
};

export function approveReviewCommand(
  input: Omit<ApproveReviewCommand, "type">,
): ApproveReviewCommand {
  return { type: "ApproveReview", ...input } as ApproveReviewCommand;
}
