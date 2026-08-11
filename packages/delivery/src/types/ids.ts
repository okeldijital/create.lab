declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type DeliveryId = Brand<string, "DeliveryId">;
export type DeliveryPackageId = Brand<string, "DeliveryPackageId">;
export type DeliveryItemId = Brand<string, "DeliveryItemId">;
export type DeliveryReceiptId = Brand<string, "DeliveryReceiptId">;

export function asDeliveryId(value: string): DeliveryId {
  return value as DeliveryId;
}
export function asDeliveryPackageId(value: string): DeliveryPackageId {
  return value as DeliveryPackageId;
}
export function asDeliveryItemId(value: string): DeliveryItemId {
  return value as DeliveryItemId;
}
export function asDeliveryReceiptId(value: string): DeliveryReceiptId {
  return value as DeliveryReceiptId;
}
