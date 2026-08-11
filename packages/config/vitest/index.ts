import type { UserConfig } from "vitest/config";

/**
 * Shared Vitest configuration for Creative Lab workspace packages and apps.
 * Centralized under BUILD-000A (@creative-lab/config).
 */
export const sharedVitestConfig: UserConfig["test"] = {
  globals: false,
  environment: "node",
  include: ["src/**/*.{test,spec}.ts"],
  exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  coverage: {
    provider: "v8",
    reporter: ["text", "json", "html", "lcov"],
    include: ["src/**/*.ts"],
    exclude: ["src/**/*.{test,spec}.ts", "src/**/index.ts", "**/node_modules/**", "**/dist/**"],
    thresholds: {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
  },
  passWithNoTests: true,
};

export default sharedVitestConfig;
