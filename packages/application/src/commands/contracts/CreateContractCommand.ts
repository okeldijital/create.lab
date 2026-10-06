import type { Command } from "../Command.js";

export type CreateContractCommand = Command<"CreateContract"> & {
  readonly customerId: string;
  readonly quotationId: string;
  readonly contractNumber?: string;
  readonly effectiveDate: Date;
  readonly expiryDate?: Date | null;
};

export function createContractCommand(
  input: Omit<CreateContractCommand, "type">,
): CreateContractCommand {
  return { type: "CreateContract", ...input };
}
