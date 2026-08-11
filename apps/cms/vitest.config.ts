import { defineConfig } from "vitest/config";
import { sharedVitestConfig } from "../../vitest.shared";

export default defineConfig({
  test: {
    ...sharedVitestConfig,
    name: "cms",
    include: [
      "collections/**/*.{test,spec}.ts",
      "access/**/*.{test,spec}.ts",
      "hooks/**/*.{test,spec}.ts",
      "utilities/**/*.{test,spec}.ts",
    ],
  },
});
