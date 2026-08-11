import type { Engagement } from "@creative-lab/engagement";
import type { EngagementDto } from "../dto/common.js";

export class EngagementMapper {
  static toDto(engagement: Engagement): EngagementDto {
    return {
      id: engagement.id,
      organizationId: engagement.organizationId,
      engagementNumber: engagement.engagementNumber.value,
      customerId: engagement.customerId,
      contractId: engagement.contractId,
      status: engagement.status,
    };
  }
}
