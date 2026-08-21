import { describe, expect, it } from "vitest";
import { MissingRequestContextError, toApplicationContext } from "./request-context.js";

describe("toApplicationContext", () => {
  it("creates an application context from trusted actor and organization claims", () => {
    const context = toApplicationContext({
      organizationId: "org_01",
      actorId: "actor_01",
      correlationId: "corr_01",
    });

    expect(context.organizationId).toBe("org_01");
    expect(context.actorId).toBe("actor_01");
    expect(context.correlationId).toBe("corr_01");
  });

  it("fails closed when actor context is missing", () => {
    expect(() =>
      toApplicationContext({ organizationId: "org_01", actorId: null }),
    ).toThrow(MissingRequestContextError);
  });

  it("fails closed when organization context is missing", () => {
    expect(() =>
      toApplicationContext({ organizationId: null, actorId: "actor_01" }),
    ).toThrow(MissingRequestContextError);
  });
});
