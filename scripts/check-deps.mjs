#!/usr/bin/env node
/**
 * Dependency graph enforcement for Creative Lab packages.
 *
 * Formal matrix (BUILD-000A / EPIC-208):
 *
 *   core            → none
 *   config          → none
 *   ui              → core, config
 *   infrastructure  → core, config
 *   organization    → core, infrastructure, config
 *   workforce       → organization, core, infrastructure, config
 *   capacity        → workforce, organization, core, infrastructure, config
 *   scheduling      → capacity, workforce, organization, core, infrastructure, config
 *   operations      → scheduling, capacity, workforce, organization, core, infrastructure, config
 *   projects        → operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   allocation      → projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   production      → allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   assets          → production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   review          → assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   delivery        → review, assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   billing         → delivery, review, assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   crm             → billing, delivery, review, assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   services        → crm, billing, delivery, review, assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   quotation       → services, crm, billing, delivery, review, assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   contracts       → quotation, services, crm, billing, delivery, review, assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   engagement      → contracts, quotation, services, crm, billing, delivery, review, assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   portfolio       → engagement, contracts, quotation, services, crm, billing, delivery, review, assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   knowledge       → portfolio, engagement, contracts, quotation, services, crm, billing, delivery, review, assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *   application    → knowledge, portfolio, engagement, contracts, quotation, services, crm, billing, delivery, review, assets, production, allocation, projects, operations, scheduling, capacity, workforce, organization, core, infrastructure, config
 *
 * Satellites (retained from BUILD-000):
 *   collaboration → core, organization
 *   test-utils    → none (may be depended on as dev utility)
 *
 * Circular and reverse edges are forbidden.
 *
 * Authority: ADR-008 Package Boundaries, Platform Constitution Title II,
 * docs/standards/package-dependencies.md.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const packagesDir = join(root, "packages");

/**
 * Explicit allow-lists per package (target short names without scope).
 * This is the mechanical source of truth aligned with package-dependencies.md.
 */
const ALLOWED_DEPS = {
  core: new Set([]),
  config: new Set([]),
  ui: new Set(["core", "config"]),
  infrastructure: new Set(["core", "config"]),
  organization: new Set(["core", "infrastructure", "config"]),
  workforce: new Set(["organization", "core", "infrastructure", "config"]),
  capacity: new Set(["workforce", "organization", "core", "infrastructure", "config"]),
  scheduling: new Set([
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  operations: new Set([
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  projects: new Set([
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  allocation: new Set([
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  production: new Set([
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  assets: new Set([
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  review: new Set([
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  delivery: new Set([
    "review",
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  billing: new Set([
    "delivery",
    "review",
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  crm: new Set([
    "billing",
    "delivery",
    "review",
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  services: new Set([
    "crm",
    "billing",
    "delivery",
    "review",
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  quotation: new Set([
    "services",
    "crm",
    "billing",
    "delivery",
    "review",
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  contracts: new Set([
    "quotation",
    "services",
    "crm",
    "billing",
    "delivery",
    "review",
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  engagement: new Set([
    "contracts",
    "quotation",
    "services",
    "crm",
    "billing",
    "delivery",
    "review",
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  portfolio: new Set([
    "engagement",
    "contracts",
    "quotation",
    "services",
    "crm",
    "billing",
    "delivery",
    "review",
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  knowledge: new Set([
    "portfolio",
    "engagement",
    "contracts",
    "quotation",
    "services",
    "crm",
    "billing",
    "delivery",
    "review",
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  application: new Set([
    "knowledge",
    "portfolio",
    "engagement",
    "contracts",
    "quotation",
    "services",
    "crm",
    "billing",
    "delivery",
    "review",
    "assets",
    "production",
    "allocation",
    "projects",
    "operations",
    "scheduling",
    "capacity",
    "workforce",
    "organization",
    "core",
    "infrastructure",
    "config",
  ]),
  collaboration: new Set(["core", "organization"]),
  "test-utils": new Set([]),
};

const REGISTERED = new Set(Object.keys(ALLOWED_DEPS));

const SCOPE = "@creative-lab";

function listPackages() {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function readPackageJson(name) {
  const p = join(packagesDir, name, "package.json");
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

function shortName(dep) {
  if (!dep.startsWith(`${SCOPE}/`)) return null;
  return dep.slice(SCOPE.length + 1);
}

function collectWorkspaceDeps(pkgJson) {
  const deps = {
    ...(pkgJson.dependencies || {}),
    ...(pkgJson.peerDependencies || {}),
  };
  const names = [];
  for (const [name, version] of Object.entries(deps)) {
    const short = shortName(name);
    if (!short) continue;
    if (typeof version === "string" && version.startsWith("workspace:")) {
      names.push(short);
    } else if (short) {
      names.push(short);
    }
  }
  return names;
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
      if (!REGISTERED.has(dep)) {
        console.error(
          `Package "${name}" depends on unregistered workspace package "${dep}"`,
        );
        failed = true;
        continue;
      }
      if (!allowed.has(dep)) {
        console.error(
          `Dependency violation: ${name} → ${dep} is not allowed by the matrix.`,
        );
        failed = true;
      }
    }
  }

  // Detect simple cycles (DFS)
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
    for (const next of graph.get(node) || []) {
      dfs(next, [...path, node]);
    }
    visiting.delete(node);
    visited.add(node);
  }
  for (const name of graph.keys()) dfs(name, []);

  if (failed) {
    process.exit(1);
  }

  console.log("Dependency graph check passed.");
  console.log(
    `Registered packages: ${[...REGISTERED].sort().join(", ")}`,
  );
  for (const name of [...graph.keys()].sort()) {
    const deps = [...(graph.get(name) || [])].sort();
    console.log(
      `  ${name} → {${deps.length ? deps.join(", ") : "∅"}}`,
    );
  }
}

main();
