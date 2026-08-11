/**
 * Shared ESLint flat-config preset for Creative Lab.
 * Scaffolding / centralization under BUILD-000A.
 *
 * Consumers: root eslint.config.mjs (and future package-local configs if needed).
 */

import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * @param {object} [options]
 * @param {string[]} [options.ignores]
 * @returns {import("typescript-eslint").ConfigArray}
 */
export function createEslintConfig(options = {}) {
  const extraIgnores = options.ignores ?? [];

  return tseslint.config(
    {
      ignores: [
        "**/dist/**",
        "**/coverage/**",
        "**/node_modules/**",
        "**/.turbo/**",
        "**/pnpm-lock.yaml",
        ...extraIgnores,
      ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        globals: {
          ...globals.node,
        },
      },
      rules: {
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { prefer: "type-imports", fixStyle: "separate-type-imports" },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
          },
        ],
        "no-console": ["warn", { allow: ["warn", "error"] }],
      },
    },
    {
      files: ["**/*.{test,spec}.{ts,tsx}", "**/vitest.config.ts", "**/vitest.workspace.ts"],
      rules: {
        "no-console": "off",
      },
    },
  );
}

export default createEslintConfig();
