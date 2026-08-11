import type { Command } from "../Command.js";

export type CreateProjectCommand = Command<"CreateProject"> & {
  readonly name: string;
  readonly projectNumber?: string;
  readonly description?: string | null;
  readonly startDate?: string;
  readonly targetEndDate?: string;
};

export function createProjectCommand(
  input: Omit<CreateProjectCommand, "type">,
): CreateProjectCommand {
  return { type: "CreateProject", ...input } as CreateProjectCommand;
}
