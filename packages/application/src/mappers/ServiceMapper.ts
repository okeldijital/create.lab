import type { Service } from "@creative-lab/services";
import type { ServiceDto } from "../dto/common.js";

export class ServiceMapper {
  static toDto(service: Service): ServiceDto {
    return {
      id: service.id,
      organizationId: service.organizationId,
      serviceCode: service.serviceCode.value,
      name: service.name.value,
      description: service.description.value,
      categoryId: service.categoryId,
      defaultPriceBookId: service.defaultPriceBookId,
      pricingModel: service.pricingModel,
      status: service.status,
    };
  }
}
