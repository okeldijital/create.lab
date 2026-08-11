export const DeliveryStatus = {
  DRAFT: "DRAFT",
  READY: "READY",
  DELIVERED: "DELIVERED",
  CONFIRMED: "CONFIRMED",
  ARCHIVED: "ARCHIVED",
} as const;

export type DeliveryStatus =
  (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export const DELIVERY_TRANSITIONS: Readonly<
  Record<DeliveryStatus, readonly DeliveryStatus[]>
> = {
  [DeliveryStatus.DRAFT]: [DeliveryStatus.READY, DeliveryStatus.ARCHIVED],
  [DeliveryStatus.READY]: [
    DeliveryStatus.DELIVERED,
    DeliveryStatus.DRAFT,
    DeliveryStatus.ARCHIVED,
  ],
  [DeliveryStatus.DELIVERED]: [
    DeliveryStatus.CONFIRMED,
    DeliveryStatus.ARCHIVED,
  ],
  [DeliveryStatus.CONFIRMED]: [DeliveryStatus.ARCHIVED],
  [DeliveryStatus.ARCHIVED]: [],
};

export function canTransitionDelivery(
  from: DeliveryStatus,
  to: DeliveryStatus,
): boolean {
  if (from === to) return true;
  return DELIVERY_TRANSITIONS[from].includes(to);
}
