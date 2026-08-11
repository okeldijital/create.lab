export const ReservationStatus = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  CONVERTED: "CONVERTED",
  CANCELLED: "CANCELLED",
} as const;

export type ReservationStatus =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const RESERVATION_TRANSITIONS: Readonly<
  Record<ReservationStatus, readonly ReservationStatus[]>
> = {
  [ReservationStatus.REQUESTED]: [
    ReservationStatus.APPROVED,
    ReservationStatus.CANCELLED,
  ],
  [ReservationStatus.APPROVED]: [
    ReservationStatus.CONVERTED,
    ReservationStatus.CANCELLED,
  ],
  [ReservationStatus.CONVERTED]: [],
  [ReservationStatus.CANCELLED]: [],
};

export function canTransitionReservation(
  from: ReservationStatus,
  to: ReservationStatus,
): boolean {
  if (from === to) return true;
  return RESERVATION_TRANSITIONS[from].includes(to);
}
