import type { Organization } from "@creative-lab/organization";
import type { OrganizationDto } from "../dto/common.js";

export class OrganizationMapper {
  static toDto(organization: Organization): OrganizationDto {
    return {
      id: organization.id,
      name: organization.name.value,
      slug: organization.slug.value,
      status: organization.status,
      displayName: organization.displayName,
      timezone: organization.timezone.value,
      locale: organization.locale.value,
      currency: organization.currency.value,
    };
  }
}
