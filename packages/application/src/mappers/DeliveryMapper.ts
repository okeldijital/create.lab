import type { Delivery } from "@creative-lab/delivery";
import type { DeliveryDto } from "../dto/common.js";

export class DeliveryMapper {
  static toDto(delivery: Delivery): DeliveryDto {
    return {
      id: delivery.id,
      organizationId: delivery.organizationId,
      status: delivery.status,
      projectId: delivery.projectId,
    };
  }
}
