#!/usr/bin/env node
/**
 * Verifies required scaffolding files exist for packages and apps.
 * BUILD-003 adds the integration/composition package to the library scaffold.
 */

import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** Standard TypeScript library packages */
const libraryPackages = [
  "core",
  "infrastructure",
  "ui",
  "organization",
  "workforce",
  "capacity",
  "scheduling",
  "allocation",
  "operations",
  "projects",
  "production",
  "review",
  "delivery",
  "billing",
  "crm",
  "services",
  "quotation",
  "contracts",
  "engagement",
  "portfolio",
  "knowledge",
  "application",
  "composition",
  "collaboration",
  "assets",
  "test-utils",
];

const libraryPackageFiles = ["package.json", "tsconfig.json", "README.md", "src/index.ts"];

/** Config package is presets-only (no src/tsconfig required) */
const configPackageFiles = [
  "package.json",
  "README.md",
  "eslint/index.mjs",
  "prettier/index.json",
  "typescript/base.json",
  "vitest/index.ts",
  "tailwind/index.ts",
  "commitlint/index.cjs",
  "lint-staged/index.cjs",
  "shared/constants.json",
];

const required = [
  "package.json",
  "pnpm-workspace.yaml",
  "turbo.json",
  "tsconfig.base.json",
  "eslint.config.mjs",
  "vitest.workspace.ts",
  "vitest.shared.ts",
  "README.md",
  "platform.manifest.json",
  "docs/constitution/Platform-Constitution.md",
  "docs/architecture/domain-map.md",
  "docs/architecture/package-classification.md",
  "docs/standards/package-dependencies.md",
  ".github/workflows/ci.yml",
  "apps/web/package.json",
  "apps/cms/package.json",
];

const infrastructureDirs = [
  "config",
  "logging",
  "storage",
  "email",
  "queue",
  "cache",
  "search",
  "payload",
  "auth",
  "integrations",
  "scheduler",
  "events",
  "adapters",
  "utils",
];

const uiDirs = [
  "foundations/colors",
  "foundations/typography",
  "foundations/spacing",
  "foundations/radius",
  "foundations/elevation",
  "foundations/motion",
  "tokens",
  "icons",
  "primitives/Box",
  "primitives/Stack",
  "primitives/Grid",
  "primitives/Flex",
  "primitives/Container",
  "components/Button",
  "components/Input",
  "components/Checkbox",
  "components/Switch",
  "components/Select",
  "components/Card",
  "components/Table",
  "components/Dialog",
  "components/Modal",
  "components/Drawer",
  "components/Badge",
  "components/Tabs",
  "components/Navigation",
  "components/Sidebar",
  "components/Header",
  "components/Footer",
  "layouts",
  "hooks",
  "providers",
  "utils",
];

const coreDirs = [
  "authorization",
  "events",
  "repositories",
  "errors",
  "validation",
  "types",
  "utils",
];

const errors = [];

for (const rel of required) {
  if (!existsSync(join(root, rel))) {
    errors.push(`Missing required path: ${rel}`);
  }
}

for (const name of libraryPackages) {
  for (const file of libraryPackageFiles) {
    const rel = `packages/${name}/${file}`;
    if (!existsSync(join(root, rel))) {
      errors.push(`Missing package scaffold: ${rel}`);
    }
  }
}

for (const file of configPackageFiles) {
  const rel = `packages/config/${file}`;
  if (!existsSync(join(root, rel))) {
    errors.push(`Missing config package scaffold: ${rel}`);
  }
}

for (const dir of coreDirs) {
  const rel = `packages/core/src/${dir}`;
  if (!existsSync(join(root, rel))) {
    errors.push(`Missing core structure: ${rel}`);
  }
}

for (const dir of infrastructureDirs) {
  const rel = `packages/infrastructure/src/${dir}`;
  if (!existsSync(join(root, rel))) {
    errors.push(`Missing infrastructure structure: ${rel}`);
  }
}

for (const dir of uiDirs) {
  const rel = `packages/ui/src/${dir}`;
  if (!existsSync(join(root, rel))) {
    errors.push(`Missing ui structure: ${rel}`);
  }
}

if (errors.length) {
  console.error("Scaffold check failed:\n");
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}

console.log("Scaffold check passed.");
