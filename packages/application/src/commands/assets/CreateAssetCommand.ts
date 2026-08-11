import type { Command } from "../Command.js";

export type CreateAssetCommand = Command<"CreateAsset"> & {
  readonly name: string;
  readonly assetNumber?: string;
  readonly projectId?: string;
  readonly productionId?: string;
};

export function createAssetCommand(
  input: Omit<CreateAssetCommand, "type">,
): CreateAssetCommand {
  return { type: "CreateAsset", ...input } as CreateAssetCommand;
}
