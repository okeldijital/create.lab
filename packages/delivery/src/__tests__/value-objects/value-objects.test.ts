import { describe, expect, it } from "vitest";
import { DeliveryValidationError } from "../../errors/DeliveryErrors.js";
import { DeliveryNotes } from "../../value-objects/DeliveryNotes.js";
import { DeliveryReference } from "../../value-objects/DeliveryReference.js";
import { PackageDescription } from "../../value-objects/PackageDescription.js";
import { PackageName } from "../../value-objects/PackageName.js";
import { ReceiptNotes } from "../../value-objects/ReceiptNotes.js";
import { RecipientReference } from "../../value-objects/RecipientReference.js";

describe("Value objects", () => {
  it("DeliveryReference required and generate", () => {
    expect(() => DeliveryReference.create("")).toThrow(DeliveryValidationError);
    expect(DeliveryReference.create("DEL-1").value).toBe("DEL-1");
    expect(DeliveryReference.generate().value.startsWith("DEL-")).toBe(true);
  });

  it("PackageName required", () => {
    expect(PackageName.create("  Pack  ").value).toBe("Pack");
    expect(() => PackageName.create("")).toThrow(DeliveryValidationError);
  });

  it("PackageDescription optional", () => {
    expect(PackageDescription.create(null).value).toBeNull();
  });

  it("DeliveryNotes and ReceiptNotes optional", () => {
    expect(DeliveryNotes.create(undefined).value).toBeNull();
    expect(ReceiptNotes.create("ok").value).toBe("ok");
  });

  it("RecipientReference required", () => {
    expect(() => RecipientReference.create("")).toThrow(
      DeliveryValidationError,
    );
    expect(RecipientReference.create("client").value).toBe("client");
  });

  it("value equality", () => {
    expect(
      PackageName.create("A").equals(PackageName.create("A")),
    ).toBe(true);
  });

  it("DeliveryReference max length", () => {
    expect(() => DeliveryReference.create("x".repeat(65))).toThrow(
      DeliveryValidationError,
    );
  });

  it("PackageDescription max length", () => {
    expect(() => PackageDescription.create("x".repeat(5001))).toThrow(
      DeliveryValidationError,
    );
  });

  it("DeliveryNotes max length", () => {
    expect(() => DeliveryNotes.create("x".repeat(2001))).toThrow(
      DeliveryValidationError,
    );
  });

  it("ReceiptNotes max length", () => {
    expect(() => ReceiptNotes.create("x".repeat(2001))).toThrow(
      DeliveryValidationError,
    );
  });
});
