import type { Reservation, ReservationId, ReservationRepository } from "@creative-lab/allocation";
import type { OrganizationId } from "@creative-lab/organization";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { reservations } from "./schema.js";
import { ReservationMapper } from "./mappers.js";

export class PostgresReservationRepository implements ReservationRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ReservationId): Promise<Reservation | null> {
    const rows = await this.db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
    return rows[0] ? ReservationMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Reservation[]> {
    const rows = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.organizationId, organizationId));
    return rows.map(ReservationMapper.fromRow);
  }

  async findByResource(resourceId: string): Promise<Reservation[]> {
    const rows = await this.db.select().from(reservations).where(eq(reservations.resourceId, resourceId));
    return rows.map(ReservationMapper.fromRow);
  }

  async save(reservation: Reservation): Promise<void> {
    await this.db.insert(reservations).values(ReservationMapper.toRow(reservation));
  }

  async update(reservation: Reservation): Promise<void> {
    await this.db
      .update(reservations)
      .set(ReservationMapper.toRow(reservation))
      .where(eq(reservations.id, reservation.id));
  }

  async cancel(id: ReservationId): Promise<void> {
    // Status transition only; service also calls update(entity) with full snapshot.
    const now = new Date();
    await this.db
      .update(reservations)
      .set({ status: "CANCELLED", updatedAt: now })
      .where(eq(reservations.id, id));
  }

  async convert(id: ReservationId): Promise<void> {
    // Status transition only; service mutates entity (convertedAllocationId) then update(entity).
    const now = new Date();
    await this.db
      .update(reservations)
      .set({ status: "CONVERTED", updatedAt: now })
      .where(eq(reservations.id, id));
  }

  async exists(id: ReservationId): Promise<boolean> {
    const rows = await this.db
      .select({ id: reservations.id })
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);
    return rows.length > 0;
  }
}
