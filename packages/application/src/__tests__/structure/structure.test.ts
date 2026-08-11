import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const requiredFolders = [
  "commands",
  "queries",
  "handlers",
  "services",
  "dto",
  "mappers",
  "ports",
  "authorization",
  "transactions",
  "events",
  "validators",
  "interfaces",
  "errors",
  "utils",
  "types",
  "__tests__",
];

describe("Application package structure", () => {
  for (const folder of requiredFolders) {
    it(`has src/${folder}`, () => {
      expect(existsSync(join(root, "src", folder))).toBe(true);
    });
  }

  it("has public index.ts", () => {
    expect(existsSync(join(root, "src", "index.ts"))).toBe(true);
  });

  it("has package metadata", () => {
    expect(existsSync(join(root, "package.json"))).toBe(true);
    expect(existsSync(join(root, "tsconfig.json"))).toBe(true);
    expect(existsSync(join(root, "README.md"))).toBe(true);
  });
});
