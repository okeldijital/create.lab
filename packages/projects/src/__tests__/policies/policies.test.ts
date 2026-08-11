import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Project } from "../../aggregates/Project/Project.js";
import { ProjectDependency } from "../../aggregates/ProjectDependency/ProjectDependency.js";
import { ProjectPhase } from "../../aggregates/ProjectPhase/ProjectPhase.js";
import {
  DependencyCycleError,
  DuplicateProjectError,
  PhaseSequenceError,
  SelfDependencyError,
} from "../../errors/ProjectErrors.js";
import {
  DependencyPolicy,
  PhasePolicy,
  ProjectLifecyclePolicy,
} from "../../policies/index.js";

const orgId = asOrganizationId("org-1");

function project(name: string, id?: string) {
  return Project.create({
    organizationId: orgId,
    name,
    ownerId: "o1",
    id,
  });
}

describe("ProjectLifecyclePolicy", () => {
  it("enforces unique project names per organization", () => {
    const a = project("Album Production");
    expect(() =>
      ProjectLifecyclePolicy.assertUniqueName(
        [a],
        "album production",
        orgId,
      ),
    ).toThrow(DuplicateProjectError);
  });
});

describe("PhasePolicy", () => {
  it("rejects duplicate sequences and gaps", () => {
    const p = project("P1");
    const ph1 = ProjectPhase.create({
      organizationId: orgId,
      projectId: p.id,
      name: "Planning",
      sequence: 1,
    });
    expect(() =>
      PhasePolicy.assertUniqueSequence([ph1], 1),
    ).toThrow();
    expect(() => PhasePolicy.assertNoGaps([ph1], 3)).toThrow(
      PhaseSequenceError,
    );
    expect(() => PhasePolicy.assertNoGaps([ph1], 2)).not.toThrow();
  });

  it("enforces single active phase and ordered start", () => {
    const p = project("P1");
    const ph1 = ProjectPhase.create({
      organizationId: orgId,
      projectId: p.id,
      name: "Planning",
      sequence: 1,
    });
    ph1.start();
    const ph2 = ProjectPhase.create({
      organizationId: orgId,
      projectId: p.id,
      name: "Production",
      sequence: 2,
    });
    expect(() => PhasePolicy.assertSingleActive([ph1, ph2])).toThrow(
      PhaseSequenceError,
    );
    expect(() => PhasePolicy.assertOrderedStart([ph1, ph2], ph2)).toThrow(
      PhaseSequenceError,
    );
    ph1.complete();
    expect(() => PhasePolicy.assertOrderedStart([ph1, ph2], ph2)).not.toThrow();
  });
});

describe("DependencyPolicy", () => {
  it("blocks self and cycle dependencies", () => {
    const a = project("A", "a");
    const b = project("B", "b");
    const c = project("C", "c");
    expect(() => DependencyPolicy.assertNotSelf(a.id, a.id)).toThrow(
      SelfDependencyError,
    );

    const ab = ProjectDependency.create({
      organizationId: orgId,
      projectId: a.id,
      dependsOnProjectId: b.id,
    });
    const bc = ProjectDependency.create({
      organizationId: orgId,
      projectId: b.id,
      dependsOnProjectId: c.id,
    });
    // c → a would cycle if a → b → c
    expect(() =>
      DependencyPolicy.assertNoCycle([ab, bc], c.id, a.id),
    ).toThrow(DependencyCycleError);

    // a → c is fine (no cycle)
    expect(() =>
      DependencyPolicy.assertNoCycle([ab, bc], a.id, c.id),
    ).not.toThrow();
  });
});
