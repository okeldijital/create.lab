import type { Command } from "../Command.js";

export type CreateCustomerCommand = Command<"CreateCustomer"> & {
  readonly name: string;
  readonly customerNumber?: string;
  readonly legalName?: string | null;
  readonly industry?: string | null;
  readonly billingAddress?: string | null;
};

export function createCustomerCommand(
  input: Omit<CreateCustomerCommand, "type">,
): CreateCustomerCommand {
  return { type: "CreateCustomer", ...input } as CreateCustomerCommand;
}
