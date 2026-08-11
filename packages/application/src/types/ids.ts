/** Opaque actor identity for application authorization context. */
export type ActorId = string & { readonly __brand?: "ActorId" };

export type Permission =
  | "organization.create"
  | "organization.archive"
  | "organization.read"
  | "project.create"
  | "project.read"
  | "project.archive"
  | "production.start"
  | "production.read"
  | "asset.create"
  | "asset.read"
  | "asset.archive"
  | "review.approve"
  | "review.read"
  | "delivery.create"
  | "delivery.read"
  | "invoice.create"
  | "invoice.read"
  | "invoice.approve"
  | "quote.create"
  | "quote.read"
  | "quote.issue"
  | "contract.activate"
  | "contract.read"
  | "engagement.create"
  | "engagement.read"
  | "portfolio.create"
  | "portfolio.read"
  | "knowledge.create"
  | "knowledge.read"
  | "knowledge.search";

export function asActorId(value: string): ActorId {
  return value as ActorId;
}
