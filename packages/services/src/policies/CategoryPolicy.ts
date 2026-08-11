import type { Service } from "../aggregates/Service/Service.js";
import type { ServiceCategory } from "../aggregates/ServiceCategory/ServiceCategory.js";
import { ServiceStatus } from "../enums/ServiceStatus.js";
import {
  CategoryInUseError,
  DuplicateCategoryNameError,
  InvalidServiceStateError,
} from "../errors/ServicesErrors.js";

export class CategoryPolicy {
  static assertMutable(category: ServiceCategory): void {
    if (category.isArchived) {
      throw new InvalidServiceStateError(
        "Archived categories are immutable.",
      );
    }
  }

  static assertUniqueName(
    organizationId: string,
    name: string,
    existing: readonly ServiceCategory[],
    excludeId?: string,
  ): void {
    const normalized = name.trim().toLowerCase();
    const dup = existing.find(
      (c) =>
        !c.isArchived &&
        c.name.value.toLowerCase() === normalized &&
        c.id !== excludeId,
    );
    if (dup) {
      throw new DuplicateCategoryNameError(name.trim(), organizationId);
    }
  }

  static assertCanArchive(
    category: ServiceCategory,
    services: readonly Service[],
  ): void {
    CategoryPolicy.assertMutable(category);
    const active = services.find(
      (s) =>
        s.categoryId === category.id &&
        s.status === ServiceStatus.ACTIVE,
    );
    if (active) {
      throw new CategoryInUseError(category.id);
    }
  }
}
