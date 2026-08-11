import type { Command } from "../Command.js";

export type DeliverProjectCommand = Command<"DeliverProject"> & {
  readonly deliveryId: string;
};

export function deliverProjectCommand(
  deliveryId: string,
): DeliverProjectCommand {
  return { type: "DeliverProject", deliveryId };
}
