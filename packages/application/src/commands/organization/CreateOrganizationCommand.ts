import type { Command } from "../Command.js";

export type CreateOrganizationCommand = Command<"CreateOrganization"> & {
  readonly name: string;
  readonly slug?: string;
  readonly displayName?: string;
  readonly legalName?: string;
  readonly description?: string | null;
  readonly timezone?: string;
  readonly locale?: string;
  readonly currency?: string;
};

export function createOrganizationCommand(
  input: Omit<CreateOrganizationCommand, "type">,
): CreateOrganizationCommand {
  return { type: "CreateOrganization", ...input } as CreateOrganizationCommand;
}
