import type { InteractionRepository, Interaction, InteractionId, CustomerId } from "@creative-lab/crm";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { interactions } from "./schema.js";
import { InteractionMapper } from "./mappers.js";

export class PostgresInteractionRepository implements InteractionRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: InteractionId): Promise<Interaction | null> { const rows = await this.db.select().from(interactions).where(eq(interactions.id, id)).limit(1); return rows[0] ? InteractionMapper.fromRow(rows[0]) : null; }
  async findByCustomer(customerId: CustomerId): Promise<Interaction[]> { const rows = await this.db.select().from(interactions).where(eq(interactions.customerId, customerId)); return rows.map(InteractionMapper.fromRow); }
  async save(interaction: Interaction): Promise<void> { await this.db.insert(interactions).values(InteractionMapper.toRow(interaction)); }
  async exists(id: InteractionId): Promise<boolean> { const rows = await this.db.select({ id: interactions.id }).from(interactions).where(eq(interactions.id, id)).limit(1); return rows.length > 0; }
}
