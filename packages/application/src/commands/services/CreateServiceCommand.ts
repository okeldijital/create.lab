import type { Command } from "../Command.js";

export type CreateServiceCommand = Command<"CreateService"> & {
  readonly serviceCode: string;
  readonly name: string;
  readonly description?: string | null;
  readonly categoryId: string;
  readonly defaultPriceBookId?: string | null;
  readonly pricingModel?: string;
};

export function createServiceCommand(
  input: Omit<CreateServiceCommand, "type">,
): CreateServiceCommand {
  return { type: "CreateService", ...input } as CreateServiceCommand;
}
