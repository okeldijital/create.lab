declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type ServiceId = Brand<string, "ServiceId">;
export type ServiceCategoryId = Brand<string, "ServiceCategoryId">;
export type PriceBookId = Brand<string, "PriceBookId">;
export type PriceRuleId = Brand<string, "PriceRuleId">;

export function asServiceId(value: string): ServiceId {
  return value as ServiceId;
}
export function asServiceCategoryId(value: string): ServiceCategoryId {
  return value as ServiceCategoryId;
}
export function asPriceBookId(value: string): PriceBookId {
  return value as PriceBookId;
}
export function asPriceRuleId(value: string): PriceRuleId {
  return value as PriceRuleId;
}
