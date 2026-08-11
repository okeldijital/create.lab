import type { Command } from "../Command.js";

export type CreateEngagementCommand = Command<"CreateEngagement"> & {
  readonly name: string;
  readonly customerId: string;
  readonly contractId?: string;
  readonly projectId?: string;
  readonly engagementNumber?: string;
};

export function createEngagementCommand(
  input: Omit<CreateEngagementCommand, "type">,
): CreateEngagementCommand {
  return { type: "CreateEngagement", ...input } as CreateEngagementCommand;
}
