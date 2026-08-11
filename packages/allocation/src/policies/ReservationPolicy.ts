import type { Reservation } from "../aggregates/Reservation/Reservation.js";
import {
  ReservationStatus,
  canTransitionReservation,
} from "../enums/ReservationStatus.js";
import { ReservationLifecycleError } from "../errors/AllocationErrors.js";

/**
 * Reservation lifecycle: REQUESTED → APPROVED → CONVERTED | CANCELLED.
 */
export class ReservationPolicy {
  static assertCanTransition(
    reservation: Reservation,
    to: ReservationStatus,
  ): void {
    if (!canTransitionReservation(reservation.status, to)) {
      throw new ReservationLifecycleError(
        `Illegal reservation transition: ${reservation.status} → ${to}.`,
      );
    }
  }

  static assertCanApprove(reservation: Reservation): void {
    ReservationPolicy.assertCanTransition(
      reservation,
      ReservationStatus.APPROVED,
    );
  }

  static assertCanConvert(reservation: Reservation): void {
    ReservationPolicy.assertCanTransition(
      reservation,
      ReservationStatus.CONVERTED,
    );
  }

  static assertCanCancel(reservation: Reservation): void {
    ReservationPolicy.assertCanTransition(
      reservation,
      ReservationStatus.CANCELLED,
    );
  }
}
