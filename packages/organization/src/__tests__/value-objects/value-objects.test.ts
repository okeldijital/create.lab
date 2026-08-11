import { describe, expect, it } from "vitest";
import {
  Currency,
  DepartmentName,
  Locale,
  OrganizationName,
  OrganizationSlug,
  StudioName,
  TeamName,
  Timezone,
  Weekday,
  WorkingHours,
  WorkingWeek,
} from "../../value-objects/index.js";
import { OrganizationValidationError } from "../../errors/OrganizationErrors.js";
import { OrganizationSettingsValidationError } from "../../errors/SettingsErrors.js";
import { InvalidStudioCapacityError } from "../../errors/StudioErrors.js";
import { Studio } from "../../aggregates/Studio/Studio.js";
import { StudioType } from "../../enums/StudioType.js";
import { asOrganizationId } from "../../types/ids.js";

describe("Value Objects", () => {
  describe("OrganizationName", () => {
    it("creates and trims name", () => {
      const name = OrganizationName.create("  Acme  ");
      expect(name.value).toBe("Acme");
    });

    it("rejects empty name", () => {
      expect(() => OrganizationName.create("   ")).toThrow(
        OrganizationValidationError,
      );
    });

    it("supports equality", () => {
      expect(
        OrganizationName.create("Acme").equals(OrganizationName.create("Acme")),
      ).toBe(true);
    });
  });

  describe("OrganizationSlug", () => {
    it("normalizes to lowercase", () => {
      expect(OrganizationSlug.create("Acme-Studios").value).toBe("acme-studios");
    });

    it("rejects invalid characters", () => {
      expect(() => OrganizationSlug.create("Acme Studios!")).toThrow(
        OrganizationValidationError,
      );
    });

    it("derives from name", () => {
      expect(OrganizationSlug.fromName("Acme Studios").value).toBe(
        "acme-studios",
      );
    });
  });

  describe("Timezone / Locale / Currency", () => {
    it("accepts valid identifiers", () => {
      expect(Timezone.create("America/New_York").value).toBe("America/New_York");
      expect(Locale.create("en-US").value).toBe("en-US");
      expect(Currency.create("usd").value).toBe("USD");
    });

    it("rejects invalid currency", () => {
      expect(() => Currency.create("US")).toThrow(OrganizationValidationError);
    });
  });

  describe("WorkingWeek / WorkingHours", () => {
    it("defaults Mon–Fri", () => {
      const week = WorkingWeek.defaultMondayToFriday();
      expect(week.includes(Weekday.MONDAY)).toBe(true);
      expect(week.includes(Weekday.SUNDAY)).toBe(false);
    });

    it("rejects empty week", () => {
      expect(() => WorkingWeek.create([])).toThrow(
        OrganizationSettingsValidationError,
      );
    });

    it("validates hours window", () => {
      const hours = WorkingHours.create("09:00", "17:00");
      expect(hours.start).toBe("09:00");
      expect(() => WorkingHours.create("17:00", "09:00")).toThrow(
        OrganizationSettingsValidationError,
      );
    });
  });

  describe("DepartmentName / TeamName / StudioName", () => {
    it("require non-empty values", () => {
      expect(() => DepartmentName.create("")).toThrow();
      expect(() => TeamName.create("")).toThrow();
      expect(() => StudioName.create("")).toThrow();
    });

    it("case-insensitive equality for department names", () => {
      expect(
        DepartmentName.create("Production").equals(
          DepartmentName.create("production"),
        ),
      ).toBe(true);
    });
  });

  describe("Studio capacity (via aggregate VO validation)", () => {
    it("rejects negative capacity", () => {
      expect(() =>
        Studio.create({
          organizationId: asOrganizationId("org-1"),
          name: "Suite A",
          type: StudioType.PHYSICAL,
          capacity: -1,
        }),
      ).toThrow(InvalidStudioCapacityError);
    });
  });
});
