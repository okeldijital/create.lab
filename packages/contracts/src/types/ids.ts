declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type ContractId = Brand<string, "ContractId">;
export type ContractVersionId = Brand<string, "ContractVersionId">;
export type ContractTermId = Brand<string, "ContractTermId">;
export type ContractAmendmentId = Brand<string, "ContractAmendmentId">;

export function asContractId(value: string): ContractId {
  return value as ContractId;
}
export function asContractVersionId(value: string): ContractVersionId {
  return value as ContractVersionId;
}
export function asContractTermId(value: string): ContractTermId {
  return value as ContractTermId;
}
export function asContractAmendmentId(value: string): ContractAmendmentId {
  return value as ContractAmendmentId;
}
