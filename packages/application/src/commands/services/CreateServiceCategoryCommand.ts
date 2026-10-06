import type { Command } from "../Command.js";

export type CreateServiceCategoryCommand = Command<"CreateServiceCategory"> & {
  readonly name: string;
  readonly description?: string | null;
};

export function createServiceCategoryCommand(
  input: Omit<CreateServiceCategoryCommand, "type">,
): CreateServiceCategoryCommand {
  return { type: "CreateServiceCategory", ...input } as CreateServiceCategoryCommand;
}
