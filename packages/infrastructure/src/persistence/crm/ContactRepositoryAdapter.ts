import type { ContactRepository, Contact, ContactId, CustomerId } from "@creative-lab/crm";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { contacts } from "./schema.js";
import { ContactMapper } from "./mappers.js";

export class PostgresContactRepository implements ContactRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: ContactId): Promise<Contact | null> { const rows = await this.db.select().from(contacts).where(eq(contacts.id, id)).limit(1); return rows[0] ? ContactMapper.fromRow(rows[0]) : null; }
  async findByCustomer(customerId: CustomerId): Promise<Contact[]> { const rows = await this.db.select().from(contacts).where(eq(contacts.customerId, customerId)); return rows.map(ContactMapper.fromRow); }
  async findPrimaryContact(customerId: CustomerId): Promise<Contact | null> { const rows = await this.db.select().from(contacts).where(and(eq(contacts.customerId, customerId), eq(contacts.isPrimary, true))).limit(1); return rows[0] ? ContactMapper.fromRow(rows[0]) : null; }
  async save(contact: Contact): Promise<void> { await this.db.insert(contacts).values(ContactMapper.toRow(contact)); }
  async update(contact: Contact): Promise<void> { const row = ContactMapper.toRow(contact); await this.db.update(contacts).set(row).where(eq(contacts.id, contact.id)); }
  async archive(id: ContactId): Promise<void> { const now = new Date(); await this.db.update(contacts).set({ status: "ARCHIVED", isPrimary: false, archivedAt: now, updatedAt: now }).where(eq(contacts.id, id)); }
  async exists(id: ContactId): Promise<boolean> { const rows = await this.db.select({ id: contacts.id }).from(contacts).where(eq(contacts.id, id)).limit(1); return rows.length > 0; }
}
