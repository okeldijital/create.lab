import type { Command } from "../Command.js";

export type ArchiveOrganizationCommand = Command<"ArchiveOrganization"> & {
  readonly organizationId: string;
};

export function archiveOrganizationCommand(
  organizationId: string,
): ArchiveOrganizationCommand {
  return { type: "ArchiveOrganization", organizationId };
}
