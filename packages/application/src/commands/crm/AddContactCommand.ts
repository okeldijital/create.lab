import type { Command } from "../Command.js";

export type AddContactCommand = Command<"AddContact"> & {
  readonly customerId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string | null;
  readonly role?: string | null;
  readonly isPrimary?: boolean;
};

export function addContactCommand(
  input: Omit<AddContactCommand, "type">,
): AddContactCommand {
  return { type: "AddContact", ...input } as AddContactCommand;
}
