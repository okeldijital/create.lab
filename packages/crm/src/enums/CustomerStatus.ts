export const CustomerStatus = {
  LEAD: "LEAD",
  PROSPECT: "PROSPECT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type CustomerStatus =
  (typeof CustomerStatus)[keyof typeof CustomerStatus];

export const CUSTOMER_TRANSITIONS: Readonly<
  Record<CustomerStatus, readonly CustomerStatus[]>
> = {
  [CustomerStatus.LEAD]: [
    CustomerStatus.PROSPECT,
    CustomerStatus.ARCHIVED,
  ],
  [CustomerStatus.PROSPECT]: [
    CustomerStatus.ACTIVE,
    CustomerStatus.LEAD,
    CustomerStatus.ARCHIVED,
  ],
  [CustomerStatus.ACTIVE]: [
    CustomerStatus.INACTIVE,
    CustomerStatus.ARCHIVED,
  ],
  [CustomerStatus.INACTIVE]: [
    CustomerStatus.ACTIVE,
    CustomerStatus.ARCHIVED,
  ],
  [CustomerStatus.ARCHIVED]: [],
};

export function canTransitionCustomer(
  from: CustomerStatus,
  to: CustomerStatus,
): boolean {
  if (from === to) return true;
  return CUSTOMER_TRANSITIONS[from].includes(to);
}
