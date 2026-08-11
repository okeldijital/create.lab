/**
 * @creative-lab/delivery
 *
 * Delivery Management bounded context — EPIC-212.
 * Owns delivery state only: has approved work been officially delivered?
 * No storage, transfer, notifications, or billing.
 */

export {
  Delivery,
  DeliveryPackage,
  DeliveryItem,
  DeliveryReceipt,
} from "./aggregates/index.js";
export type {
  CreateDeliveryProps,
  DeliverySnapshot,
  CreateDeliveryPackageProps,
  DeliveryPackageSnapshot,
  CreateDeliveryItemProps,
  DeliveryItemSnapshot,
  CreateDeliveryReceiptProps,
  DeliveryReceiptSnapshot,
} from "./aggregates/index.js";

export {
  DeliveryReference,
  PackageName,
  PackageDescription,
  DeliveryNotes,
  ReceiptNotes,
  RecipientReference,
} from "./value-objects/index.js";

export {
  DeliveryStatus,
  DELIVERY_TRANSITIONS,
  canTransitionDelivery,
  PackageStatus,
  ReceiptStatus,
  DeliveryPriority,
} from "./enums/index.js";

export {
  DeliveryCreated,
  DeliveryReady,
  DeliveryDelivered,
  DeliveryConfirmed,
  DeliveryArchived,
  PackageCreated,
  PackageSealed,
  PackageArchived,
  ItemAdded,
  ItemRemoved,
  ReceiptCreated,
  ReceiptConfirmed,
  ReceiptRejected,
} from "./events/index.js";

export type {
  DeliveryRepository,
  DeliveryPackageRepository,
  DeliveryItemRepository,
  DeliveryReceiptRepository,
} from "./repositories/index.js";

export {
  DeliveryService,
  PackageService,
  ItemService,
  ReceiptService,
} from "./services/index.js";
export type {
  DeliveryServiceDeps,
  PackageServiceDeps,
  ItemServiceDeps,
  CreateItemForPackageProps,
  ReceiptServiceDeps,
} from "./services/index.js";

export {
  DeliveryLifecyclePolicy,
  PackagePolicy,
  ItemPolicy,
  ReceiptPolicy,
} from "./policies/index.js";

export {
  DeliveryFactory,
  DeliveryPackageFactory,
  DeliveryItemFactory,
  DeliveryReceiptFactory,
} from "./factories/index.js";

export {
  DeliveryNotFoundError,
  PackageNotFoundError,
  ItemNotFoundError,
  ReceiptNotFoundError,
  InvalidDeliveryStateError,
  PackageAlreadySealedError,
  DuplicateDeliveryItemError,
  DuplicateReceiptError,
  DeliveryValidationError,
} from "./errors/index.js";

export type {
  DeliveryId,
  DeliveryPackageId,
  DeliveryItemId,
  DeliveryReceiptId,
  OrganizationId,
  ProjectId,
  ProductionId,
  ReviewId,
  AssetId,
  AssetVersionId,
} from "./types/index.js";
export {
  asDeliveryId,
  asDeliveryPackageId,
  asDeliveryItemId,
  asDeliveryReceiptId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
