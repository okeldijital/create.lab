/**
 * Shared lint-staged preset scaffold for Creative Lab (BUILD-000A).
 * Activate when lint-staged is installed at the workspace root.
 */
module.exports = {
  "*.{ts,tsx,js,jsx,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};
