import { DeliveryService, type DeliveryServiceDeps, asDeliveryId } from "@creative-lab/delivery";
import type { DeliverProjectCommand } from "../../commands/delivery/DeliverProjectCommand.js";
import type { DeliveryDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import type { ApplicationContext } from "../../types/context.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";

export type DeliverProjectHandlerDeps = Omit<DeliveryServiceDeps, "eventPublisher"> & {
  eventPublisher: DeliveryServiceDeps["eventPublisher"];
};

export class DeliverProjectHandler implements CommandHandler<DeliverProjectCommand, DeliveryDto> {
  readonly commandType = "DeliverProject" as const;
  private readonly service: DeliveryService;

  constructor(deps: DeliverProjectHandlerDeps) {
    this.service = new DeliveryService(deps);
  }

  async handle(command: DeliverProjectCommand, context: ApplicationContext): Promise<DeliveryDto> {
    const delivery = await this.service.getById(asDeliveryId(command.deliveryId));
    if (String(delivery.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }
    const updated = await this.service.deliver(delivery.id);
    return {
      id: updated.id,
      organizationId: updated.organizationId,
      status: updated.status,
      projectId: updated.projectId,
    };
  }
}
