import { describe, expect, it } from "vitest";
import { Organization } from "../../aggregates/Organization/Organization.js";
import { OrganizationStatus } from "../../enums/OrganizationStatus.js";
import {
  InvalidOrganizationStatusTransitionError,
  OrganizationArchivedError,
  OrganizationValidationError,
} from "../../errors/OrganizationErrors.js";
import {
  OrganizationArchived,
  OrganizationCreated,
  OrganizationUpdated,
} from "../../events/organization-events.js";

describe("Organization aggregate", () => {
  it("creates with required fields and ACTIVE status", () => {
    const org = Organization.create({ name: "Acme Creative" });
    expect(org.name.value).toBe("Acme Creative");
    expect(org.displayName).toBe("Acme Creative");
    expect(org.legalName).toBe("Acme Creative");
    expect(org.slug.value).toBe("acme-creative");
    expect(org.status).toBe(OrganizationStatus.ACTIVE);
    expect(org.timezone.value).toBe("UTC");
    expect(org.locale.value).toBe("en-US");
    expect(org.currency.value).toBe("USD");
    expect(org.archivedAt).toBeNull();

    const events = org.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrganizationCreated);
    expect(events[0]?.eventVersion).toBe(1);
    expect(events[0]?.organizationId).toBe(org.id);
  });

  it("requires name", () => {
    expect(() => Organization.create({ name: "" })).toThrow(
      OrganizationValidationError,
    );
  });

  it("updates profile fields and emits OrganizationUpdated", () => {
    const org = Organization.create({ name: "Acme" });
    org.pullDomainEvents();
    org.update({
      displayName: "Acme Labs",
      description: "A creative lab",
      timezone: "Europe/London",
      currency: "GBP",
    });
    expect(org.displayName).toBe("Acme Labs");
    expect(org.timezone.value).toBe("Europe/London");
    expect(org.currency.value).toBe("GBP");
    const events = org.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(OrganizationUpdated);
  });

  it("allows ACTIVE → SUSPENDED → ACTIVE", () => {
    const org = Organization.create({ name: "Acme" });
    org.pullDomainEvents();
    org.changeStatus(OrganizationStatus.SUSPENDED);
    expect(org.status).toBe(OrganizationStatus.SUSPENDED);
    org.changeStatus(OrganizationStatus.ACTIVE);
    expect(org.status).toBe(OrganizationStatus.ACTIVE);
  });

  it("rejects invalid status transitions", () => {
    const org = Organization.create({ name: "Acme" });
    org.changeStatus(OrganizationStatus.INACTIVE);
    expect(() => org.changeStatus(OrganizationStatus.SUSPENDED)).toThrow(
      InvalidOrganizationStatusTransitionError,
    );
  });

  it("archives and prevents further modification", () => {
    const org = Organization.create({ name: "Acme" });
    org.pullDomainEvents();
    org.archive();
    expect(org.status).toBe(OrganizationStatus.ARCHIVED);
    expect(org.archivedAt).not.toBeNull();
    expect(org.pullDomainEvents()[0]).toBeInstanceOf(OrganizationArchived);
    expect(() => org.update({ name: "Nope" })).toThrow(
      OrganizationArchivedError,
    );
    expect(() => org.changeStatus(OrganizationStatus.ACTIVE)).toThrow(
      OrganizationArchivedError,
    );
  });

  it("reconstitutes without domain events", () => {
    const org = Organization.create({ name: "Acme" });
    const snapshot = org.toSnapshot();
    const restored = Organization.reconstitute(snapshot);
    expect(restored.id).toBe(org.id);
    expect(restored.pullDomainEvents()).toHaveLength(0);
  });
});
