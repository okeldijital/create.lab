import {
  Delivery,
  type CreateDeliveryProps,
} from "../aggregates/Delivery/Delivery.js";
import {
  DeliveryPackage,
  type CreateDeliveryPackageProps,
} from "../aggregates/DeliveryPackage/DeliveryPackage.js";
import {
  DeliveryItem,
  type CreateDeliveryItemProps,
} from "../aggregates/DeliveryItem/DeliveryItem.js";
import {
  DeliveryReceipt,
  type CreateDeliveryReceiptProps,
} from "../aggregates/DeliveryReceipt/DeliveryReceipt.js";

export const DeliveryFactory = {
  create: (props: CreateDeliveryProps) => Delivery.create(props),
  reconstitute: Delivery.reconstitute.bind(Delivery),
};

export const DeliveryPackageFactory = {
  create: (props: CreateDeliveryPackageProps) => DeliveryPackage.create(props),
  reconstitute: DeliveryPackage.reconstitute.bind(DeliveryPackage),
};

export const DeliveryItemFactory = {
  create: (props: CreateDeliveryItemProps) => DeliveryItem.create(props),
  reconstitute: DeliveryItem.reconstitute.bind(DeliveryItem),
};

export const DeliveryReceiptFactory = {
  create: (props: CreateDeliveryReceiptProps) => DeliveryReceipt.create(props),
  reconstitute: DeliveryReceipt.reconstitute.bind(DeliveryReceipt),
};
