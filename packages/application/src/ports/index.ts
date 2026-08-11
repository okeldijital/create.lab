/**
 * Application consumes domain repository ports exclusively.
 * Concrete implementations live in infrastructure — never here.
 *
 * Re-export commonly orchestrated ports for wiring convenience.
 */

export type { OrganizationRepository } from "@creative-lab/organization";
export type { ProjectRepository } from "@creative-lab/projects";
export type { InvoiceRepository } from "@creative-lab/billing";
export type { QuoteRepository } from "@creative-lab/quotation";
export type { ContractRepository } from "@creative-lab/contracts";
export type { EngagementRepository } from "@creative-lab/engagement";
export type { PortfolioRepository } from "@creative-lab/portfolio";
export type { KnowledgeArticleRepository } from "@creative-lab/knowledge";
export type { AssetRepository } from "@creative-lab/assets";
export type { ProductionRepository } from "@creative-lab/production";
export type { ReviewRepository } from "@creative-lab/review";
export type { DeliveryRepository } from "@creative-lab/delivery";
