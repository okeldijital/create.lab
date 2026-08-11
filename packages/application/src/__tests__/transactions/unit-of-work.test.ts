import { describe, expect, it } from "vitest";
import { InMemoryUnitOfWork } from "../helpers/fakes.js";

describe("UnitOfWork", () => {
  it("begin commit cycle", async () => {
    const uow = new InMemoryUnitOfWork();
    expect(uow.isActive()).toBe(false);
    await uow.begin();
    expect(uow.isActive()).toBe(true);
    await uow.commit();
    expect(uow.isActive()).toBe(false);
    expect(uow.began).toBe(1);
    expect(uow.committed).toBe(1);
  });

  it("begin rollback cycle", async () => {
    const uow = new InMemoryUnitOfWork();
    await uow.begin();
    await uow.rollback();
    expect(uow.rolledBack).toBe(1);
    expect(uow.isActive()).toBe(false);
  });

  it("rejects nested begin", async () => {
    const uow = new InMemoryUnitOfWork();
    await uow.begin();
    await expect(uow.begin()).rejects.toThrow(/already active/);
  });

  it("rejects commit without begin", async () => {
    const uow = new InMemoryUnitOfWork();
    await expect(uow.commit()).rejects.toThrow(/not active/);
  });

  it("rejects rollback without begin", async () => {
    const uow = new InMemoryUnitOfWork();
    await expect(uow.rollback()).rejects.toThrow(/not active/);
  });
});
