import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Initiative } from "../../aggregates/Initiative/Initiative.js";
import { Portfolio } from "../../aggregates/Portfolio/Portfolio.js";
import { PortfolioMilestone } from "../../aggregates/PortfolioMilestone/PortfolioMilestone.js";
import { Program } from "../../aggregates/Program/Program.js";
import { PortfolioStatus } from "../../enums/PortfolioStatus.js";
import {
  DuplicateInitiativeTitleError,
  InvalidPortfolioStateError,
  PortfolioValidationError,
  ProgramSequenceError,
} from "../../errors/PortfolioErrors.js";
import { InitiativePolicy } from "../../policies/InitiativePolicy.js";
import { PortfolioLifecyclePolicy } from "../../policies/PortfolioLifecyclePolicy.js";
import { PortfolioMilestonePolicy } from "../../policies/PortfolioMilestonePolicy.js";
import { ProgramPolicy } from "../../policies/ProgramPolicy.js";

const orgId = asOrganizationId("org-1");

function portfolio() {
  return Portfolio.create({
    organizationId: orgId,
    name: "P",
    startDate: new Date("2026-01-01"),
  });
}

describe("PortfolioLifecyclePolicy", () => {
  it("allows transitions", () => {
    const p = portfolio();
    PortfolioLifecyclePolicy.assertCanTransition(p, PortfolioStatus.ACTIVE);
    p.activate();
    PortfolioLifecyclePolicy.assertActive(p);
  });

  it("blocks structure when completed", () => {
    const p = portfolio();
    p.activate();
    p.complete();
    expect(() =>
      PortfolioLifecyclePolicy.assertStructurallyEditable(p),
    ).toThrow(InvalidPortfolioStateError);
  });
});

describe("ProgramPolicy", () => {
  it("unique sequence", () => {
    const p = portfolio();
    const prog = Program.create({
      organizationId: orgId,
      portfolioId: p.id,
      name: "A",
      sequence: 1,
    });
    ProgramPolicy.assertUniqueSequence(2, [prog]);
    expect(() => ProgramPolicy.assertUniqueSequence(1, [prog])).toThrow(
      ProgramSequenceError,
    );
  });

  it("nextSequence and archived immutable", () => {
    const p = portfolio();
    const prog = Program.create({
      organizationId: orgId,
      portfolioId: p.id,
      name: "A",
      sequence: 3,
    });
    expect(ProgramPolicy.nextSequence([prog])).toBe(4);
    prog.activate();
    prog.complete();
    prog.archive();
    expect(() => ProgramPolicy.assertEditable(prog)).toThrow(
      InvalidPortfolioStateError,
    );
  });
});

describe("InitiativePolicy", () => {
  it("unique title", () => {
    const p = portfolio();
    const i = Initiative.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "Grow",
    });
    expect(() =>
      InitiativePolicy.assertUniqueTitle(p.id, "grow", [i]),
    ).toThrow(DuplicateInitiativeTitleError);
  });

  it("terminal immutable", () => {
    const p = portfolio();
    const i = Initiative.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "X",
    });
    i.activate();
    i.complete();
    expect(() => InitiativePolicy.assertMutable(i)).toThrow(
      InvalidPortfolioStateError,
    );
  });
});

describe("PortfolioMilestonePolicy", () => {
  it("one active and chronological", () => {
    const p = portfolio();
    const m1 = PortfolioMilestone.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "M1",
      targetDate: new Date("2026-02-01"),
      sequence: 1,
    });
    m1.activate();
    const m2 = PortfolioMilestone.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "M2",
      targetDate: new Date("2026-03-01"),
      sequence: 2,
    });
    expect(() =>
      PortfolioMilestonePolicy.assertOneActive([m1, m2]),
    ).toThrow(PortfolioValidationError);
    PortfolioMilestonePolicy.assertChronological(
      2,
      new Date("2026-03-01"),
      [m1],
    );
    expect(() =>
      PortfolioMilestonePolicy.assertChronological(
        2,
        new Date("2026-01-15"),
        [m1],
      ),
    ).toThrow(PortfolioValidationError);
  });

  it("unique sequence and next", () => {
    const p = portfolio();
    const m = PortfolioMilestone.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "M",
      targetDate: new Date("2026-02-01"),
      sequence: 1,
    });
    expect(() =>
      PortfolioMilestonePolicy.assertUniqueSequence(1, [m]),
    ).toThrow(PortfolioValidationError);
    expect(PortfolioMilestonePolicy.nextSequence([m])).toBe(2);
  });
});

describe("PortfolioLifecyclePolicy extras", () => {
  it("blocks active assert when draft", () => {
    const p = portfolio();
    expect(() => PortfolioLifecyclePolicy.assertActive(p)).toThrow(
      InvalidPortfolioStateError,
    );
  });

  it("allows archive transition", () => {
    const p = portfolio();
    PortfolioLifecyclePolicy.assertCanTransition(
      p,
      PortfolioStatus.ARCHIVED,
    );
  });
});

describe("InitiativePolicy extras", () => {
  it("allows unique different titles", () => {
    const p = portfolio();
    const i = Initiative.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "A",
    });
    expect(() =>
      InitiativePolicy.assertUniqueTitle(p.id, "B", [i]),
    ).not.toThrow();
  });
});
