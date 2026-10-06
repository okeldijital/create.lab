import type { Command } from "../Command.js";

export type MarkContractPendingSignatureCommand =
  Command<"MarkContractPendingSignature"> & {
    readonly contractId: string;
  };

export function markContractPendingSignatureCommand(
  contractId: string,
): MarkContractPendingSignatureCommand {
  return { type: "MarkContractPendingSignature", contractId };
}
