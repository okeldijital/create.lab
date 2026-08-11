import type { Review } from "@creative-lab/review";
import type { ReviewDto } from "../dto/common.js";

export class ReviewMapper {
  static toDto(review: Review): ReviewDto {
    return {
      id: review.id,
      organizationId: review.organizationId,
      title: review.title.value,
      status: review.status,
      projectId: review.projectId,
    };
  }
}
