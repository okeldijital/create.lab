import { describe, expect, it } from "vitest";
import {
  Department,
  Organization,
  OrganizationSettings,
  Studio,
  StudioType,
  Team,
} from "@creative-lab/organization";
import {
  DepartmentMapper,
  OrganizationMapper,
  OrganizationSettingsMapper,
  StudioMapper,
  TeamMapper,
  departments,
  organizationSettings,
  organizations,
  studios,
  teams,
} from "../persistence/organization/index.js";

describe("organization persistence mappings", () => {
  const now = new Date("2026-08-12T10:00:00.000Z");
  const organization = Organization.create({
    id: "11111111-1111-4111-8111-111111111111",
    name: "Creative Lab",
    slug: "creative-lab",
    now,
  });

  it("maps organizations to persistence rows and reconstitutes them", () => {
    const row = OrganizationMapper.toRow(organization);
    const restored = OrganizationMapper.fromRow(row);

    expect(row.id).toBe(organization.id);
    expect(row.slug).toBe("creative-lab");
    expect(restored.toSnapshot()).toEqual(organization.toSnapshot());
  });

  it("maps departments without changing the organization boundary", () => {
    const department = Department.create({
      id: "22222222-2222-4222-8222-222222222222",
      organizationId: organization.id,
      name: "Production",
      now,
    });
    const restored = DepartmentMapper.fromRow(DepartmentMapper.toRow(department));
    expect(restored.organizationId).toBe(organization.id);
    expect(restored.toSnapshot()).toEqual(department.toSnapshot());
  });

  it("maps teams with their department reference", () => {
    const departmentId = "22222222-2222-4222-8222-222222222222" as never;
    const team = Team.create({
      id: "33333333-3333-4333-8333-333333333333",
      organizationId: organization.id,
      departmentId,
      name: "Audio",
      now,
    });
    const restored = TeamMapper.fromRow(TeamMapper.toRow(team));
    expect(restored.departmentId).toBe(departmentId);
    expect(restored.toSnapshot()).toEqual(team.toSnapshot());
  });

  it("maps studios including capacity and type", () => {
    const studio = Studio.create({
      id: "44444444-4444-4444-8444-444444444444",
      organizationId: organization.id,
      name: "Studio A",
      type: StudioType.PHYSICAL,
      capacity: 8,
      location: "Durban",
      now,
    });
    const restored = StudioMapper.fromRow(StudioMapper.toRow(studio));
    expect(restored.capacity).toBe(8);
    expect(restored.type).toBe(StudioType.PHYSICAL);
    expect(restored.toSnapshot()).toEqual(studio.toSnapshot());
  });

  it("maps organization settings including JSON and array fields", () => {
    const settings = OrganizationSettings.defaultsFor(organization.id, { now });
    const restored = OrganizationSettingsMapper.fromRow(OrganizationSettingsMapper.toRow(settings));
    expect(restored.organizationId).toBe(organization.id);
    expect(restored.workingWeek.days).toEqual(settings.workingWeek.days);
    expect(restored.workingHours.start).toBe(settings.workingHours.start);
    expect(restored.policies).toEqual(settings.policies);
  });

  it("exposes all five organization tables", () => {
    expect(organizations).toBeDefined();
    expect(departments).toBeDefined();
    expect(teams).toBeDefined();
    expect(studios).toBeDefined();
    expect(organizationSettings).toBeDefined();
  });
});
