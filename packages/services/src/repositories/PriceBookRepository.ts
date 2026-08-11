import type { OrganizationId } from "@creative-lab/organization";
import type { PriceBook } from "../aggregates/PriceBook/PriceBook.js";
import type { PriceBookStatus } from "../enums/PriceBookStatus.js";
import type { PriceBookId } from "../types/ids.js";

export interface PriceBookRepository {
  findById(id: PriceBookId): Promise<PriceBook | null>;
  findByOrganization(organizationId: OrganizationId): Promise<PriceBook[]>;
  findByStatus(status: PriceBookStatus): Promise<PriceBook[]>;
  findPublished(organizationId: OrganizationId): Promise<PriceBook[]>;
  findByCurrency(
    organizationId: OrganizationId,
    currency: string,
  ): Promise<PriceBook[]>;
  save(priceBook: PriceBook): Promise<void>;
  update(priceBook: PriceBook): Promise<void>;
  archive(id: PriceBookId): Promise<void>;
  exists(id: PriceBookId): Promise<boolean>;
}
