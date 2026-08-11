import type { Command } from "../Command.js";

export type ActivateContractCommand = Command<"ActivateContract"> & {
  readonly contractId: string;
};

export function activateContractCommand(
  contractId: string,
): ActivateContractCommand {
  return { type: "ActivateContract", contractId };
}
