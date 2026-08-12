#!/usr/bin/env node
/**
 * Dependency graph enforcement for Creative Lab packages.
 * BUILD-005 adds Infrastructure → Organization repository adapters.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const packagesDir = join(root, "packages");

const ALLOWED_DEPS = {
  core: new Set([]),
  config: new Set([]),
  ui: new Set(["core", "config"]),
  infrastructure: new Set(["application", "organization", "core", "config"]),
  organization: new Set(["core", "infrastructure", "config"]),
  workforce: new Set(["organization", "core", "infrastructure", "config"]),
  capacity: new Set(["workforce", "organization", "core", "infrastructure", "config"]),
  scheduling: new Set(["capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  operations: new Set(["scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  projects: new Set(["operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  allocation: new Set(["projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  production: new Set(["allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  assets: new Set(["production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  review: new Set(["assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  delivery: new Set(["review", "assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  billing: new Set(["delivery", "review", "assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  crm: new Set(["billing", "delivery", "review", "assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  services: new Set(["crm", "billing", "delivery", "review", "assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  quotation: new Set(["services", "crm", "billing", "delivery", "review", "assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  contracts: new Set(["quotation", "services", "crm", "billing", "delivery", "review", "assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  engagement: new Set(["contracts", "quotation", "services", "crm", "billing", "delivery", "review", "assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  portfolio: new Set(["engagement", "contracts", "quotation", "services", "crm", "billing", "delivery", "review", "assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  knowledge: new Set(["portfolio", "engagement", "contracts", "quotation", "services", "crm", "billing", "delivery", "review", "assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  application: new Set(["knowledge", "portfolio", "engagement", "contracts", "quotation", "services", "crm", "billing", "delivery", "review", "assets", "production", "allocation", "projects", "operations", "scheduling", "capacity", "workforce", "organization", "core", "infrastructure", "config"]),
  composition: new Set(["application", "infrastructure"]),
  collaboration: new Set(["core", "organization"]),
  "test-utils": new Set([]),
};

const REGISTERED = new Set(Object.keys(ALLOWED_DEPS));
const SCOPE = "@creative-lab";

function listPackages() {
  return readdirSync(packagesDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}

function readPackageJson(name) {
  const p = join(packagesDir, name, "package.json");
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

function shortName(dep) {
  return dep.startsWith(`${SCOPE}/`) ? dep.slice(SCOPE.length + 1) : null;
}

function collectWorkspaceDeps(pkgJson) {
  const deps = { ...(pkgJson.dependencies || {}), ...(pkgJson.peerDependencies || {}) };
  return Object.entries(deps).flatMap(([name, version]) => {
    const short = shortName(name);
    return short && typeof version === "string" && version.startsWith("workspace:") ? [short] : [];
  });
}

function main() {
  const packages = listPackages();
  let failed = false;
  const graph = new Map();

  for (const name of packages) {
    if (!REGISTERED.has(name)) {
      console.error(`Unregistered package directory: packages/${name}`);
      failed = true;
      continue;
    }
    const pkg = readPackageJson(name);
    if (!pkg) {
      console.error(`Missing package.json for ${name}`);
      failed = true;
      continue;
    }
    const allowed = ALLOWED_DEPS[name];
    const actual = collectWorkspaceDeps(pkg);
    graph.set(name, new Set(actual));
    for (const dep of actual) {
      if (!REGISTERED.has(dep) || !allowed.has(dep)) {
        console.error(`Dependency violation: ${name} → ${dep} is not allowed by the matrix.`);
        failed = true;
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function dfs(node, path) {
    if (visiting.has(node)) {
      console.error(`Circular dependency detected: ${[...path, node].join(" → ")}`);
      failed = true;
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const next of graph.get(node) || []) dfs(next, [...path, node]);
    visiting.delete(node);
    visited.add(node);
  }
  for (const name of graph.keys()) dfs(name, []);

  if (failed) process.exit(1);
  console.log("Dependency graph check passed.");
}

main();
