import type { ServiceCategory } from "@creative-lab/services";
import type { ServiceCategoryDto } from "../dto/common.js";

export class ServiceCategoryMapper {
  static toDto(category: ServiceCategory): ServiceCategoryDto {
    return {
      id: category.id,
      organizationId: category.organizationId,
      name: category.name.value,
      description: category.description.value,
      status: category.status,
    };
  }
}
