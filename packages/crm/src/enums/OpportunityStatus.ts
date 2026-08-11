export const OpportunityStatus = {
  OPEN: "OPEN",
  QUALIFIED: "QUALIFIED",
  PROPOSAL: "PROPOSAL",
  NEGOTIATION: "NEGOTIATION",
  WON: "WON",
  LOST: "LOST",
  ARCHIVED: "ARCHIVED",
} as const;

export type OpportunityStatus =
  (typeof OpportunityStatus)[keyof typeof OpportunityStatus];

export const OPPORTUNITY_TRANSITIONS: Readonly<
  Record<OpportunityStatus, readonly OpportunityStatus[]>
> = {
  [OpportunityStatus.OPEN]: [
    OpportunityStatus.QUALIFIED,
    OpportunityStatus.LOST,
    OpportunityStatus.ARCHIVED,
  ],
  [OpportunityStatus.QUALIFIED]: [
    OpportunityStatus.PROPOSAL,
    OpportunityStatus.LOST,
    OpportunityStatus.ARCHIVED,
  ],
  [OpportunityStatus.PROPOSAL]: [
    OpportunityStatus.NEGOTIATION,
    OpportunityStatus.LOST,
    OpportunityStatus.ARCHIVED,
  ],
  [OpportunityStatus.NEGOTIATION]: [
    OpportunityStatus.WON,
    OpportunityStatus.LOST,
    OpportunityStatus.ARCHIVED,
  ],
  [OpportunityStatus.WON]: [OpportunityStatus.ARCHIVED],
  [OpportunityStatus.LOST]: [OpportunityStatus.ARCHIVED],
  [OpportunityStatus.ARCHIVED]: [],
};

export function canTransitionOpportunity(
  from: OpportunityStatus,
  to: OpportunityStatus,
): boolean {
  if (from === to) return true;
  return OPPORTUNITY_TRANSITIONS[from].includes(to);
}
