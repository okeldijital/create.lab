import type { OrganizationId } from "@creative-lab/organization";
import type { PriceBook, PriceBookId, PriceBookRepository, PriceBookStatus } from "@creative-lab/services";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { priceBooks } from "./schema.js";
import { PriceBookMapper } from "./mappers.js";

export class PostgresPriceBookRepository implements PriceBookRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: PriceBookId): Promise<PriceBook | null> {
    const rows = await this.db.select().from(priceBooks).where(eq(priceBooks.id, id)).limit(1);
    return rows[0] ? PriceBookMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<PriceBook[]> {
    const rows = await this.db.select().from(priceBooks).where(eq(priceBooks.organizationId, organizationId));
    return rows.map(PriceBookMapper.fromRow);
  }

  async findByStatus(status: PriceBookStatus): Promise<PriceBook[]> {
    const rows = await this.db.select().from(priceBooks).where(eq(priceBooks.status, status));
    return rows.map(PriceBookMapper.fromRow);
  }

  async findPublished(organizationId: OrganizationId): Promise<PriceBook[]> {
    const rows = await this.db.select().from(priceBooks).where(and(eq(priceBooks.organizationId, organizationId), eq(priceBooks.status, "PUBLISHED")));
    return rows.map(PriceBookMapper.fromRow);
  }

  async findByCurrency(organizationId: OrganizationId, currency: string): Promise<PriceBook[]> {
    const rows = await this.db.select().from(priceBooks).where(and(eq(priceBooks.organizationId, organizationId), eq(priceBooks.currency, currency)));
    return rows.map(PriceBookMapper.fromRow);
  }

  async save(priceBook: PriceBook): Promise<void> {
    await this.db.insert(priceBooks).values(PriceBookMapper.toRow(priceBook));
  }

  async update(priceBook: PriceBook): Promise<void> {
    await this.db.update(priceBooks).set(PriceBookMapper.toRow(priceBook)).where(eq(priceBooks.id, priceBook.id));
  }

  async archive(id: PriceBookId): Promise<void> {
    const now = new Date();
    await this.db.update(priceBooks).set({ status: "ARCHIVED", archivedAt: now, updatedAt: now }).where(eq(priceBooks.id, id));
  }

  async exists(id: PriceBookId): Promise<boolean> {
    const rows = await this.db.select({ id: priceBooks.id }).from(priceBooks).where(eq(priceBooks.id, id)).limit(1);
    return rows.length > 0;
  }
}
