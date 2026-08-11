import type { Production } from "@creative-lab/production";
import type { ProductionDto } from "../dto/common.js";

export class ProductionMapper {
  static toDto(production: Production): ProductionDto {
    return {
      id: production.id,
      organizationId: production.organizationId,
      name: production.name.value,
      status: production.status,
      projectId: production.projectId,
    };
  }
}
