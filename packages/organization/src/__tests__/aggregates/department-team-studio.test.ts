import { describe, expect, it } from "vitest";
import { Department } from "../../aggregates/Department/Department.js";
import { Team } from "../../aggregates/Team/Team.js";
import { Studio } from "../../aggregates/Studio/Studio.js";
import { DepartmentStatus } from "../../enums/DepartmentStatus.js";
import { TeamStatus } from "../../enums/TeamStatus.js";
import { StudioStatus } from "../../enums/StudioStatus.js";
import { StudioType } from "../../enums/StudioType.js";
import { asOrganizationId, asDepartmentId } from "../../types/ids.js";
import { DepartmentCreated } from "../../events/department-events.js";
import { TeamCreated } from "../../events/team-events.js";
import { StudioCreated, StudioArchived } from "../../events/studio-events.js";
import { DepartmentValidationError } from "../../errors/DepartmentErrors.js";
import { InvalidStudioCapacityError } from "../../errors/StudioErrors.js";

const orgId = asOrganizationId("org-1");

describe("Department aggregate", () => {
  it("creates under an organization", () => {
    const dept = Department.create({
      organizationId: orgId,
      name: "Production",
      description: "Prod unit",
    });
    expect(dept.organizationId).toBe(orgId);
    expect(dept.name.value).toBe("Production");
    expect(dept.status).toBe(DepartmentStatus.ACTIVE);
    expect(dept.parentDepartmentId).toBeNull();
    expect(dept.pullDomainEvents()[0]).toBeInstanceOf(DepartmentCreated);
  });

  it("rejects self as parent", () => {
    const id = asDepartmentId("dept-1");
    expect(() =>
      Department.create({
        id,
        organizationId: orgId,
        name: "X",
        parentDepartmentId: id,
      }),
    ).toThrow(DepartmentValidationError);
  });

  it("archives to INACTIVE", () => {
    const dept = Department.create({ organizationId: orgId, name: "Finance" });
    dept.pullDomainEvents();
    dept.archive();
    expect(dept.status).toBe(DepartmentStatus.INACTIVE);
  });
});

describe("Team aggregate", () => {
  it("creates under department and organization", () => {
    const deptId = asDepartmentId("dept-1");
    const team = Team.create({
      organizationId: orgId,
      departmentId: deptId,
      name: "Mastering Team",
    });
    expect(team.departmentId).toBe(deptId);
    expect(team.status).toBe(TeamStatus.ACTIVE);
    expect(team.pullDomainEvents()[0]).toBeInstanceOf(TeamCreated);
  });

  it("updates and archives", () => {
    const team = Team.create({
      organizationId: orgId,
      departmentId: asDepartmentId("dept-1"),
      name: "Web Team",
    });
    team.pullDomainEvents();
    team.update({ description: "Frontend" });
    expect(team.description).toBe("Frontend");
    team.archive();
    expect(team.status).toBe(TeamStatus.INACTIVE);
  });
});

describe("Studio aggregate", () => {
  it("creates with capacity and type", () => {
    const studio = Studio.create({
      organizationId: orgId,
      name: "Studio A",
      type: StudioType.PHYSICAL,
      capacity: 8,
      location: "Building 1",
    });
    expect(studio.capacity).toBe(8);
    expect(studio.status).toBe(StudioStatus.AVAILABLE);
    expect(studio.pullDomainEvents()[0]).toBeInstanceOf(StudioCreated);
  });

  it("rejects negative capacity", () => {
    expect(() =>
      Studio.create({
        organizationId: orgId,
        name: "X",
        type: StudioType.VIRTUAL,
        capacity: -5,
      }),
    ).toThrow(InvalidStudioCapacityError);
  });

  it("archives and blocks updates", () => {
    const studio = Studio.create({
      organizationId: orgId,
      name: "Podcast Room",
      type: StudioType.HYBRID,
      capacity: 2,
    });
    studio.pullDomainEvents();
    studio.archive();
    expect(studio.status).toBe(StudioStatus.ARCHIVED);
    expect(studio.pullDomainEvents()[0]).toBeInstanceOf(StudioArchived);
    expect(() => studio.update({ name: "Nope" })).toThrow();
  });
});
