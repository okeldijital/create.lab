import type { OrganizationId } from "@creative-lab/organization";
import type { Reservation } from "../aggregates/Reservation/Reservation.js";
import type { ReservationId } from "../types/ids.js";

export interface ReservationRepository {
  findById(id: ReservationId): Promise<Reservation | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Reservation[]>;
  findByResource(resourceId: string): Promise<Reservation[]>;
  save(reservation: Reservation): Promise<void>;
  update(reservation: Reservation): Promise<void>;
  cancel(id: ReservationId): Promise<void>;
  convert(id: ReservationId): Promise<void>;
  exists(id: ReservationId): Promise<boolean>;
}
