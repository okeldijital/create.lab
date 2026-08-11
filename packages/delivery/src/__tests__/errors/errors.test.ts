import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  DeliveryNotFoundError,
  DeliveryValidationError,
  DuplicateDeliveryItemError,
  DuplicateReceiptError,
  InvalidDeliveryStateError,
  ItemNotFoundError,
  PackageAlreadySealedError,
  PackageNotFoundError,
  ReceiptNotFoundError,
} from "../../errors/DeliveryErrors.js";

describe("Error model", () => {
  it("extends DomainError with codes", () => {
    const cases: DomainError[] = [
      new DeliveryNotFoundError("x"),
      new PackageNotFoundError("p"),
      new ItemNotFoundError("i"),
      new ReceiptNotFoundError("r"),
      new InvalidDeliveryStateError("s"),
      new PackageAlreadySealedError("p"),
      new DuplicateDeliveryItemError("d"),
      new DuplicateReceiptError("rec", "del"),
      new DeliveryValidationError("v"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });
});
